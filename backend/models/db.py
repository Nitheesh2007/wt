import os
import json
import re
import copy
import uuid
import datetime
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/smart_library")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime.date, datetime.datetime)):
            return o.isoformat()
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

def serialize_doc(doc):
    if not doc:
        return doc
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        res = {}
        for k, v in doc.items():
            if k == '_id':
                res['_id'] = str(v)
            elif isinstance(v, (datetime.date, datetime.datetime)):
                res[k] = v.isoformat()
            elif isinstance(v, ObjectId):
                res[k] = str(v)
            elif isinstance(v, dict):
                res[k] = serialize_doc(v)
            elif isinstance(v, list):
                res[k] = [serialize_doc(i) for i in v]
            else:
                res[k] = v
        return res
    return doc

class PersistentJSONCollection:
    def __init__(self, name, filepath):
        self.name = name
        self.filepath = filepath
        self._data = []
        self._load()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r', encoding='utf-8') as f:
                    self._data = json.load(f)
            except Exception:
                self._data = []
        else:
            self._data = []

    def _save(self):
        try:
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(self._data, f, indent=2, cls=JSONEncoder)
        except Exception as e:
            print(f"Error saving collection {self.name}: {e}")

    def _matches(self, doc, query):
        if not query:
            return True
        for key, val in query.items():
            if key == '$or':
                if not any(self._matches(doc, subq) for subq in val):
                    return False
                continue
            if key == '$and':
                if not all(self._matches(doc, subq) for subq in val):
                    return False
                continue

            doc_val = doc.get(key)
            if isinstance(val, dict):
                for op, op_val in val.items():
                    if op == '$regex':
                        pattern = op_val
                        flags = re.IGNORECASE if '$options' in val and 'i' in val.get('$options', '') else 0
                        if not doc_val or not re.search(pattern, str(doc_val), flags):
                            return False
                    elif op == '$in':
                        if doc_val not in op_val:
                            return False
                    elif op == '$nin':
                        if doc_val in op_val:
                            return False
                    elif op == '$gt':
                        if doc_val is None or doc_val <= op_val:
                            return False
                    elif op == '$gte':
                        if doc_val is None or doc_val < op_val:
                            return False
                    elif op == '$lt':
                        if doc_val is None or doc_val >= op_val:
                            return False
                    elif op == '$lte':
                        if doc_val is None or doc_val > op_val:
                            return False
                    elif op == '$ne':
                        if str(doc_val) == str(op_val):
                            return False
            else:
                if str(doc_val) != str(val):
                    return False
        return True

    def create_index(self, *args, **kwargs):
        return "index_created"

    def insert_one(self, doc):
        d = copy.deepcopy(doc)
        if '_id' not in d or not d['_id']:
            d['_id'] = str(uuid.uuid4())
        else:
            d['_id'] = str(d['_id'])
        if 'createdAt' not in d:
            d['createdAt'] = datetime.datetime.utcnow().isoformat()
        if 'updatedAt' not in d:
            d['updatedAt'] = datetime.datetime.utcnow().isoformat()
        self._data.append(d)
        self._save()
        class InsertResult:
            def __init__(self, id_): self.inserted_id = id_
        return InsertResult(d['_id'])

    def insert_many(self, docs):
        res_ids = []
        for doc in docs:
            r = self.insert_one(doc)
            res_ids.append(r.inserted_id)
        class InsertManyResult:
            def __init__(self, ids): self.inserted_ids = ids
        return InsertManyResult(res_ids)

    def find_one(self, query=None, projection=None):
        query = query or {}
        for d in self._data:
            if self._matches(d, query):
                return copy.deepcopy(d)
        return None

    def find(self, query=None, projection=None):
        query = query or {}
        matched = [copy.deepcopy(d) for d in self._data if self._matches(d, query)]
        return Cursor(matched)

    def update_one(self, query, update, upsert=False):
        query = query or {}
        found = False
        class UpdateResult:
            def __init__(self, matched, modified):
                self.matched_count = matched
                self.modified_count = modified

        for i, d in enumerate(self._data):
            if self._matches(d, query):
                self._apply_update(d, update)
                d['updatedAt'] = datetime.datetime.utcnow().isoformat()
                self._data[i] = d
                self._save()
                return UpdateResult(1, 1)

        if upsert:
            new_doc = copy.deepcopy(query)
            self._apply_update(new_doc, update)
            self.insert_one(new_doc)
            return UpdateResult(0, 1)

        return UpdateResult(0, 0)

    def update_many(self, query, update):
        query = query or {}
        count = 0
        for i, d in enumerate(self._data):
            if self._matches(d, query):
                self._apply_update(d, update)
                d['updatedAt'] = datetime.datetime.utcnow().isoformat()
                self._data[i] = d
                count += 1
        if count > 0:
            self._save()
        class UpdateResult:
            def __init__(self, c): self.modified_count = c
        return UpdateResult(count)

    def _apply_update(self, doc, update):
        if '$set' in update:
            for k, v in update['$set'].items():
                doc[k] = v
        if '$inc' in update:
            for k, v in update['$inc'].items():
                doc[k] = doc.get(k, 0) + v
        if '$push' in update:
            for k, v in update['$push'].items():
                if k not in doc or not isinstance(doc[k], list):
                    doc[k] = []
                doc[k].append(v)
        if '$pull' in update:
            for k, v in update['$pull'].items():
                if k in doc and isinstance(doc[k], list):
                    doc[k] = [x for x in doc[k] if x != v]
        if not any(k.startswith('$') for k in update.keys()):
            for k, v in update.items():
                doc[k] = v

    def delete_one(self, query):
        query = query or {}
        for i, d in enumerate(self._data):
            if self._matches(d, query):
                del self._data[i]
                self._save()
                class DelResult:
                    def __init__(self): self.deleted_count = 1
                return DelResult()
        class DelResult:
            def __init__(self): self.deleted_count = 0
        return DelResult()

    def delete_many(self, query):
        query = query or {}
        orig_len = len(self._data)
        self._data = [d for d in self._data if not self._matches(d, query)]
        del_count = orig_len - len(self._data)
        if del_count > 0:
            self._save()
        class DelResult:
            def __init__(self, c): self.deleted_count = c
        return DelResult(del_count)

    def count_documents(self, query=None):
        query = query or {}
        return sum(1 for d in self._data if self._matches(d, query))

    def distinct(self, key, query=None):
        query = query or {}
        vals = set()
        for d in self._data:
            if self._matches(d, query) and key in d:
                val = d[key]
                if isinstance(val, list):
                    for item in val:
                        vals.add(item)
                else:
                    vals.add(val)
        return list(vals)

    def aggregate(self, pipeline):
        results = copy.deepcopy(self._data)
        for stage in pipeline:
            if '$match' in stage:
                results = [r for r in results if self._matches(r, stage['$match'])]
            elif '$group' in stage:
                grp_field = stage['$group'].get('_id')
                groups = {}
                for r in results:
                    g_key = r.get(grp_field.replace('$', '')) if isinstance(grp_field, str) and grp_field.startswith('$') else grp_field
                    if g_key not in groups:
                        groups[g_key] = []
                    groups[g_key].append(r)
                aggregated = []
                for k, items in groups.items():
                    res_item = {'_id': k}
                    for f_name, f_expr in stage['$group'].items():
                        if f_name == '_id':
                            continue
                        if isinstance(f_expr, dict):
                            if '$sum' in f_expr:
                                s_field = f_expr['$sum']
                                if s_field == 1:
                                    res_item[f_name] = len(items)
                                elif isinstance(s_field, str) and s_field.startswith('$'):
                                    field = s_field[1:]
                                    res_item[f_name] = sum(float(x.get(field, 0) or 0) for x in items)
                    aggregated.append(res_item)
                results = aggregated
            elif '$sort' in stage:
                sort_keys = list(stage['$sort'].items())
                if sort_keys:
                    key, direction = sort_keys[0]
                    results.sort(key=lambda x: str(x.get(key, '')), reverse=(direction == -1))
            elif '$limit' in stage:
                results = results[:stage['$limit']]
        return results

class Cursor:
    def __init__(self, data):
        self._data = data

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            for k, d in reversed(key_or_list):
                self._data.sort(key=lambda x: str(x.get(k, '')), reverse=(d == -1))
        elif isinstance(key_or_list, str):
            self._data.sort(key=lambda x: str(x.get(key_or_list, '')), reverse=(direction == -1))
        return self

    def skip(self, n):
        self._data = self._data[n:]
        return self

    def limit(self, n):
        self._data = self._data[:n]
        return self

    def __iter__(self):
        return iter(self._data)

    def __list__(self):
        return self._data

class DatabaseManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        self.is_connected_to_atlas = False
        self.mongo_client = None
        self.db = None

        if MONGO_URI and ("mongodb://" in MONGO_URI or "mongodb+srv://" in MONGO_URI):
            try:
                client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
                client.admin.command('ping')
                self.mongo_client = client
                db_name = MONGO_URI.split('/')[-1].split('?')[0] or "smart_library"
                self.db = client[db_name]
                self.is_connected_to_atlas = True
                print(f"[*] Successfully connected to MongoDB at {MONGO_URI.split('@')[-1]}")
            except Exception as e:
                print(f"[!] MongoDB Atlas/Local connection failed ({e}). Falling back to robust persistent document store.")
                self.is_connected_to_atlas = False

        self.collection_names = [
            "users", "books", "book_copies", "authors", "categories", "publishers",
            "transactions", "reservations", "book_requests", "book_votes", "fines",
            "notifications", "reading_history", "reading_goals", "wishlists", "reviews",
            "book_conditions", "facilities", "facility_bookings", "suppliers",
            "acquisitions", "audit_logs", "system_settings"
        ]

        self.collections = {}
        for col_name in self.collection_names:
            if self.is_connected_to_atlas and self.db is not None:
                self.collections[col_name] = self.db[col_name]
            else:
                filepath = os.path.join(DATA_DIR, f"{col_name}.json")
                self.collections[col_name] = PersistentJSONCollection(col_name, filepath)

    def get_collection(self, name):
        if name in self.collections:
            return self.collections[name]
        filepath = os.path.join(DATA_DIR, f"{name}.json")
        col = PersistentJSONCollection(name, filepath)
        self.collections[name] = col
        return col

    def get_status(self):
        return {
            "connected_to_atlas": self.is_connected_to_atlas,
            "engine": "MongoDB Atlas / PyMongo" if self.is_connected_to_atlas else "Persistent Document Store (Zero-Config / Failover)",
            "collections_count": len(self.collections),
            "data_directory": DATA_DIR
        }

db_manager = DatabaseManager()

def get_col(name):
    return db_manager.get_collection(name)
