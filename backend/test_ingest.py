import requests
import json
import time

API_BASE = "http://127.0.0.1:8000/api/v1"

def test_ingestion():
    payload = {
        "title": "Project Athena: Strategic Rebrand Sync",
        "date": "2026-04-12",
        "transcript": "Aditya: Let's settle on the name for the release. Is it Athena Intelligence or just Athena?\nRishikoli: I think Athena Command feels more premium for the Director's Cut.\nAditya: Agreed. Let's go with Athena Command. The new primary accent color for the UI should be Hyper-Blue (#00E5FF)."
    }
    
    print(f"Ingesting into {API_BASE}...")
    try:
        # Wait for backend
        for _ in range(10):
            try:
                requests.get(f"{API_BASE}/metrics/usage")
                break
            except:
                print("Waiting for backend...")
                time.sleep(2)
        
        res = requests.post(f"{API_BASE}/sources/meetings/ingest", json=payload)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_ingestion()
