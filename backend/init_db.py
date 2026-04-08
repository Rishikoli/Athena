import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    print("Connecting to postgres...")
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='AthenaPassword123!',
        host='127.0.0.1',
        port='5434'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    print("Connected. Creating DB...")
    
    try:
        cursor.execute("CREATE DATABASE aicos;")
        print("Database aicos created.")
    except Exception as e:
        print(f"Error creating DB (might already exist): {e}")

    # Set up user
    try:
        cursor.execute("CREATE USER aicos_admin WITH PASSWORD 'AthenaPassword123!';")
        cursor.execute("GRANT ALL PRIVILEGES ON DATABASE aicos TO aicos_admin;")
        print("User aicos_admin created.")
    except Exception as e:
        print(f"Error creating user (might already exist): {e}")

    cursor.close()
    conn.close()
    
    # Now connect to aicos to enable vector
    print("Connecting to aicos to create vector extension...")
    conn2 = psycopg2.connect(
        dbname='aicos',
        user='postgres',
        password='AthenaPassword123!',
        host='127.0.0.1',
        port='5434'
    )
    conn2.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor2 = conn2.cursor()
    cursor2.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    print("vector extension created.")
    cursor2.close()
    conn2.close()
    print("Database setup complete!")
except Exception as e:
    print(f"Total Failure: {e}")
