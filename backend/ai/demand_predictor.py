import datetime
from backend.models.db import get_col, serialize_doc

class DemandPredictor:
    def __init__(self):
        pass

    def analyze_inventory_health(self):
        book_col = get_col("books")
        tx_col = get_col("transactions")
        res_col = get_col("reservations")

        books = list(book_col.find({"status": {"$ne": "ARCHIVED"}}))
        total_books = len(books)
        total_copies = sum(int(b.get("totalCopies", 0)) for b in books)
        total_available = sum(int(b.get("availableCopies", 0)) for b in books)
        total_issued = sum(int(b.get("issuedCopies", 0)) for b in books)
        total_reserved = sum(int(b.get("reservedCopies", 0)) for b in books)

        all_tx = list(tx_col.find())
        all_res = list(res_col.find({"status": "WAITING"}))

        if len(all_tx) < 3:
            return {
                "has_sufficient_data": False,
                "message": "Insufficient historical data for reliable prediction. Continued circulation activity will train the prediction model.",
                "totalBooks": total_books,
                "totalCopies": total_copies,
                "availableCopies": total_available,
                "issuedCopies": total_issued,
                "reservedCopies": total_reserved,
                "highDemand": [],
                "lowDemand": [],
                "shortages": [],
                "excessCopies": [],
                "frequentlyOverdue": [],
                "healthScore": 85.0
            }

        # Calculate per-book circulation statistics
        book_metrics = {}
        for b in books:
            bid = str(b['_id'])
            book_metrics[bid] = {
                "book": serialize_doc(b),
                "borrowCount": 0,
                "activeLoans": 0,
                "overdueCount": 0,
                "reservationCount": 0,
                "totalCopies": int(b.get("totalCopies", 1)),
                "availableCopies": int(b.get("availableCopies", 0))
            }

        now = datetime.datetime.utcnow()
        for tx in all_tx:
            bid = str(tx.get("bookId"))
            if bid in book_metrics:
                book_metrics[bid]["borrowCount"] += 1
                if tx.get("status") == "ISSUED":
                    book_metrics[bid]["activeLoans"] += 1
                if tx.get("status") == "OVERDUE" or (tx.get("fineAmount", 0) > 0):
                    book_metrics[bid]["overdueCount"] += 1

        for r in all_res:
            bid = str(r.get("bookId"))
            if bid in book_metrics:
                book_metrics[bid]["reservationCount"] += 1

        # Classify high demand, low demand, shortages, excess
        high_demand = []
        low_demand = []
        shortages = []
        excess_copies = []
        frequently_overdue = []

        total_utilization = 0.0

        for bid, m in book_metrics.items():
            b = m["book"]
            borrow_rate = m["borrowCount"]
            active = m["activeLoans"]
            res = m["reservationCount"]
            tot = max(m["totalCopies"], 1)
            avail = m["availableCopies"]

            # Demand score calculation
            demand_score = (borrow_rate * 1.5) + (res * 3.0) + (active * 2.0)
            utilization = (tot - avail) / tot if tot > 0 else 0
            total_utilization += utilization

            m_data = {
                "_id": bid,
                "title": b.get("title"),
                "author": b.get("author"),
                "category": b.get("category"),
                "isbn": b.get("isbn"),
                "totalCopies": tot,
                "availableCopies": avail,
                "borrowCount": borrow_rate,
                "reservations": res,
                "demandScore": round(demand_score, 1),
                "turnoverRate": round(borrow_rate / tot, 2)
            }

            if demand_score >= 4.0 or res > 0 or (tot > 0 and avail == 0):
                # Predicted shortage calculation
                needed = max(1, int(round((res + active) - avail)))
                m_data["recommendedAdditionalCopies"] = needed
                m_data["urgency"] = "HIGH" if avail == 0 else "MODERATE"
                high_demand.append(m_data)
                if avail == 0 or res > avail:
                    shortages.append(m_data)

            elif borrow_rate == 0 and tot >= 3:
                m_data["idleCopies"] = avail
                low_demand.append(m_data)
                excess_copies.append(m_data)

            if m["overdueCount"] >= 1:
                m_data["overdueIncidents"] = m["overdueCount"]
                frequently_overdue.append(m_data)

        high_demand.sort(key=lambda x: x["demandScore"], reverse=True)
        low_demand.sort(key=lambda x: x["totalCopies"], reverse=True)
        shortages.sort(key=lambda x: x.get("recommendedAdditionalCopies", 0), reverse=True)
        frequently_overdue.sort(key=lambda x: x.get("overdueIncidents", 0), reverse=True)

        avg_utilization = total_utilization / max(len(books), 1)
        health_score = min(100.0, max(50.0, (avg_utilization * 60) + 40))

        return {
            "has_sufficient_data": True,
            "totalBooks": total_books,
            "totalCopies": total_copies,
            "availableCopies": total_available,
            "issuedCopies": total_issued,
            "reservedCopies": total_reserved,
            "averageUtilizationPercent": round(avg_utilization * 100, 1),
            "healthScore": round(health_score, 1),
            "highDemand": high_demand[:10],
            "lowDemand": low_demand[:10],
            "shortages": shortages[:10],
            "excessCopies": excess_copies[:10],
            "frequentlyOverdue": frequently_overdue[:10],
            "forecastPeriod": "Next 30 Days"
        }

demand_predictor = DemandPredictor()
