import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    print("Connecting to aicos as postgres to grant schema privileges...")
    conn = psycopg2.connect(
        dbname='aicos',
        user='postgres',
        password='AthenaPassword123!',
        host='127.0.0.1',
        port='5434'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute("GRANT ALL ON SCHEMA public TO aicos_admin;")
    print("Privileges granted on public schema.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Total Failure: {e}")
