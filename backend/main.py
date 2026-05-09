from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
import uvicorn

app = FastAPI()

# Allow React (running on a different port) to talk to Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect('students.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS performance 
                     (id INTEGER PRIMARY KEY, subject TEXT, marks INTEGER, attendance INTEGER)''')
    
    # Check if we need to insert initial data
    cursor.execute("SELECT COUNT(*) FROM performance")
    if cursor.fetchone()[0] == 0:
        data = [('Math', 85, 90), ('Physics', 78, 82), ('CS', 95, 95), ('English', 72, 75), ('Chemistry', 80, 88)]
        cursor.executemany("INSERT INTO performance (subject, marks, attendance) VALUES (?, ?, ?)", data)
        conn.commit()
    conn.close()

@app.on_event("startup")
def startup():
    init_db()

@app.get("/api/stats")
def get_stats():
    conn = sqlite3.connect('students.db')
    # Use Pandas for the 'Analysis' part of your project
    df = pd.read_sql_query("SELECT * FROM performance", conn)
    conn.close()
    
    return {
        "chartData": df.to_dict(orient='records'),
        "avg_marks": round(df['marks'].mean(), 2),
        "avg_attendance": round(df['attendance'].mean(), 2),
        "total_subjects": len(df)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)