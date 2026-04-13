from sqlalchemy import create_engine, text
import os

DATABASE_URL = "postgresql://aicos_admin:AthenaPassword123!@127.0.0.1:5435/aicos"
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("Connecting...")
        # Simple health check
        res = conn.execute(text("SELECT 1"))
        print(f"Health check: {res.fetchone()}")
        
        # Check if internal IP is reachable
        res = conn.execute(text("SELECT inet_server_addr()"))
        print(f"Server IP: {res.fetchone()}")
        
        # Attempt a dummy write to metrics (safe)
        print("Attempting write to metrics...")
        conn.execute(text("INSERT INTO metrics (token_count, task_type) VALUES (1, 'test')"))
        conn.commit()
        print("Write successful!")
except Exception as e:
    print(f"FAILURE: {e}")
