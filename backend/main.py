from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import pandas as pd
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentData(BaseModel):
    name: str
    subject: str
    marks: int
    attendance: int

def get_db():
    conn = sqlite3.connect('students.db', check_same_thread=False)
    return conn

@app.on_event("startup")
def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS performance 
                     (id INTEGER PRIMARY KEY, name TEXT, subject TEXT, marks INTEGER, attendance INTEGER)''')
    conn.commit()
    conn.close()

@app.post("/api/add_student")
def add_student(data: StudentData):
    conn = get_db()
    conn.execute("INSERT INTO performance (name, subject, marks, attendance) VALUES (?, ?, ?, ?)", 
                 (data.name, data.subject, data.marks, data.attendance))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/stats")
def get_stats():
    conn = get_db()
    df = pd.read_sql_query("SELECT * FROM performance", conn)
    conn.close()
    
    if df.empty:
        return {"chartData": [], "avg_marks": 0, "avg_attendance": 0}

    return {
        "chartData": df.to_dict(orient='records'),
        "avg_marks": int(df['marks'].mean()),
        "avg_attendance": int(df['attendance'].mean())
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)