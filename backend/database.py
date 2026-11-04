"""
database.py
Módulo de persistencia en SQLite para registrar el historial de tamizajes y pacientes evaluados.
"""

import os
import sqlite3
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(CURRENT_DIR, "screenings.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS screenings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            age REAL NOT NULL,
            sex TEXT NOT NULL,
            model_used TEXT NOT NULL,
            stratum_name TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            probability_control REAL NOT NULL,
            probability_moderado REAL NOT NULL,
            probability_severo REAL NOT NULL,
            confidence_score REAL NOT NULL,
            pdf_report_path TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_screening(patient_id, age, sex, model_used, stratum_name, risk_level,
                   prob_control, prob_moderado, prob_severo, confidence_score, pdf_path=None):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO screenings (
            patient_id, timestamp, age, sex, model_used, stratum_name, risk_level,
            probability_control, probability_moderado, probability_severo, confidence_score, pdf_report_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id, now_str, age, sex, model_used, stratum_name, risk_level,
        prob_control, prob_moderado, prob_severo, confidence_score, pdf_path
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_all_screenings(limit=50):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM screenings ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "patient_id": r["patient_id"],
            "timestamp": r["timestamp"],
            "age": r["age"],
            "sex": r["sex"],
            "model_used": r["model_used"],
            "stratum_name": r["stratum_name"],
            "risk_level": r["risk_level"],
            "probabilities": {
                "control": r["probability_control"],
                "moderado": r["probability_moderado"],
                "severo": r["probability_severo"]
            },
            "probability_severo": r["probability_severo"],
            "confidence_score": r["confidence_score"],
            "pdf_report_path": r["pdf_report_path"]
        })
    return result

def update_pdf_path(screening_id, pdf_path):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE screenings SET pdf_report_path = ? WHERE id = ?", (pdf_path, screening_id))
    conn.commit()
    conn.close()

init_db()

