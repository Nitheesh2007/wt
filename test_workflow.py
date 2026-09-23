import urllib.request
import json

def test_api():
    base_url = "http://localhost:5000"
    
    # 1. Health
    req = urllib.request.Request(f"{base_url}/api/health")
    with urllib.request.urlopen(req) as resp:
        health = json.loads(resp.read().decode())
        print(f"[+] /api/health: {health.get('data', {}).get('status')}")

    # 2. Login
    login_data = json.dumps({"email": "admin@smartlib.edu", "password": "Admin@12345"}).encode()
    req = urllib.request.Request(f"{base_url}/api/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        login_res = json.loads(resp.read().decode())
        token = login_res["data"]["token"]
        print(f"[+] Login Admin: Success (Token length: {len(token)})")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 3. Issue Book
    issue_data = json.dumps({"userId": "usr_stu_03", "bookId": "bk_07"}).encode()
    req = urllib.request.Request(f"{base_url}/api/transactions/issue", data=issue_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        issue_res = json.loads(resp.read().decode())
        tx_code = issue_res["data"]["receipt"]["transactionId"]
        print(f"[+] Issue Book: Success (TxCode: {tx_code})")

    # 4. Return Book
    return_data = json.dumps({"transactionId": tx_code}).encode()
    req = urllib.request.Request(f"{base_url}/api/transactions/return", data=return_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        ret_res = json.loads(resp.read().decode())
        print(f"[+] Return Book: Success (Book: {ret_res['data']['bookTitle']}, Fine: ${ret_res['data']['fineAmount']})")

    # 5. PDF Report
    req = urllib.request.Request(f"{base_url}/api/reports/pdf?type=inventory", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        pdf_bytes = resp.read()
        print(f"[+] PDF Report Generated: {len(pdf_bytes)} bytes")

    # 6. AI Assistant
    chat_data = json.dumps({"query": "Where is Clean Code located?"}).encode()
    req = urllib.request.Request(f"{base_url}/api/assistant/chat", data=chat_data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        chat_res = json.loads(resp.read().decode())
        print(f"[+] AI Chatbot: '{chat_res['data']['message']}'")

    print("\n[***] ALL REST API WORKFLOW TESTS PASSED CLEANLY! [***]")

if __name__ == "__main__":
    test_api()
