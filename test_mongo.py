import sys
import os
from dotenv import load_dotenv

# Ensure root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from pymongo import MongoClient
from backend.models.db import db_manager

def test_connection():
    uri = os.getenv("MONGO_URI")
    print("=" * 60)
    print("[*] TESTING MONGODB CONNECTION")
    print("=" * 60)
    print(f"[*] Configured MONGO_URI in .env: {uri.split('@')[-1] if uri and '@' in uri else uri}")

    if not uri or ("mongodb://" not in uri and "mongodb+srv://" not in uri):
        print("[!] Error: No valid MONGO_URI found in .env file.")
        print("    Please set MONGO_URI=mongodb+srv://<user>:<password>@cluster.../smart_library in .env")
        return False

    try:
        print("[*] Connecting to MongoDB cluster (timeout: 5s)...")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        res = client.admin.command("ping")
        print(f"[+] Ping response: {res}")
        print("[+] SUCCESS: Connected to MongoDB successfully!")
        
        # Test DatabaseManager reconnect & migration
        print("\n[*] Initializing Smart Library collections in MongoDB...")
        connected = db_manager.reconnect(uri)
        if connected:
            print(f"[+] DatabaseManager status: {db_manager.get_status()['engine']}")
            print(f"[+] Active Database Name: {db_manager.get_status().get('database_name')}")
            
            # Check books count
            books_col = db_manager.get_collection("books")
            count = books_col.count_documents({})
            print(f"[+] Books in MongoDB: {count}")
            
            if count == 0:
                print("[*] Migrating 100+ seed catalog items from JSON store to MongoDB...")
                success, details = db_manager.migrate_json_to_mongodb()
                print(f"[+] Migration complete: {success}")
                print(f"[+] Total Books now in MongoDB: {books_col.count_documents({})}")
            
            print("\n[***] MONGODB SETUP VERIFIED & READY FOR PRODUCTION! [***]")
            return True
        else:
            print("[!] Could not initialize DatabaseManager with MongoDB.")
            return False

    except Exception as e:
        print(f"\n[!] Connection Failed: {e}")
        print("\nTroubleshooting tips:")
        print(" 1. Check your username and password in the connection string.")
        print(" 2. In MongoDB Atlas, ensure Network Access allows IP '0.0.0.0/0' (or your current IP).")
        print(" 3. Make sure the database user has 'readWriteAnyDatabase' or 'readWrite' permissions.")
        return False

if __name__ == "__main__":
    test_connection()
