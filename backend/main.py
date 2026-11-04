"""
main.py
Servidor API REST FastAPI para la Plataforma de Estratificación Predictiva de TDAH.
Proyecto de Tesis - Universidad Nacional de San Agustín de Arequipa (UNSA).
Autor: Emerson Danny Mendoza Hilasaca (2026).
"""

import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from schemas import (
    PredictionRequest, StratificationResult, ComparisonResult,
    ScreeningHistoryItem
)
from inference_engine import engine
from database import save_screening, get_all_screenings, update_pdf_path
from report_generator import generate_clinical_pdf

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEMO_DIR = os.path.join(CURRENT_DIR, "demo_patients")
REPORTS_DIR = os.path.join(CURRENT_DIR, "reports")
FRONTEND_DIST = os.path.abspath(os.path.join(CURRENT_DIR, "..", "frontend", "dist"))

app = FastAPI(
    title="Plataforma de Estratificación Predictiva de TDAH",
    description=(
        "API REST basada en Arquitectura Híbrida CNN 1D + XGBoost para la estratificación "
        "de severidad del Trastorno por Déficit de Atención e Hiperactividad mediante biomarcadores oculares. "
        "Soporta Modelo B (Autónomo para telemedicina) y Modelo A (Clínico integral con WISC-IV WMI)."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar directorio de reportes para descarga directa
app.mount("/reports", StaticFiles(directory=REPORTS_DIR), name="reports")

# Endpoints de la API REST
@app.get("/api/v1/system-info")
def get_system_info():
    """
    Retorna metadatos oficiales del modelo, arquitectura y resultados del Capítulo IV.
    """
    return {
        "thesis_title": "Arquitectura híbrida basada en CNN 1D y XGBoost para la estratificación predictiva de la severidad del TDAH mediante biomarcadores oculares",
        "cohort_size": 1218,
        "evaluation_protocol": "StratifiedGroupKFold (K=5, Cero fuga entre sujetos)",
        "chance_level_multiclass": 33.33,
        "models": {
            "model_b": {
                "name": "Modelo B (Autónomo Eye-Tracking)",
                "features_count": 78,
                "accuracy": 45.00,
                "weighted_f1": 0.4457,
                "macro_f1": 0.3861,
                "auc_ovo": 0.5682,
                "brier_score": 0.2084,
                "sensitivity_severe": 56.55,
                "clinical_use": "Telemedicina, tamizaje escolar rápido y postas de salud."
            },
            "model_a": {
                "name": "Modelo A (Clínico Integral)",
                "features_count": 79,
                "accuracy": 42.04,
                "weighted_f1": 0.4327,
                "macro_f1": 0.3936,
                "auc_ovo": 0.5698,
                "brier_score": 0.2144,
                "sensitivity_severe": 50.00,
                "clinical_use": "Hospitales especializados con acceso a batería neuropsicológica WISC-IV."
            }
        },
        "literature_binary_benchmarks": {
            "adhd_vs_control": {"accuracy": 62.73, "f1_score": 69.20, "auc": 65.13},
            "extreme_groups_control_vs_severe": {"accuracy": 69.66, "f1_score": 81.51, "sensitivity_severe": 94.00}
        },
        "hypothesis_c4_validation": "Validada: El Modelo B supera al Modelo A en Exactitud (+2.96%) y Sensibilidad (+6.55%) sin requerir pruebas psicométricas invasivas."
    }

@app.get("/api/v1/demo-patients")
def list_demo_patients():
    """
    Lista los pacientes curados representativos disponibles para pruebas rápidas de demostración.
    """
    catalog_path = os.path.join(DEMO_DIR, "demo_catalog.json")
    if not os.path.exists(catalog_path):
        raise HTTPException(status_code=404, detail="Catálogo de demostración no encontrado.")
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    return catalog

@app.get("/api/v1/demo-patients/{patient_key}")
def get_demo_patient_detail(patient_key: str):
    """
    Retorna la información completa de un paciente demo: demografía, trayectoria de mirada,
    vectores latentes y características tabulares.
    """
    file_map = {
        "control": "patient_0_control.json",
        "moderado": "patient_1_moderado.json",
        "severo": "patient_2_severo.json"
    }
    target_file = file_map.get(patient_key.lower())
    if not target_file:
        target_file = f"patient_{patient_key}.json"
        
    full_path = os.path.join(DEMO_DIR, target_file)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"Paciente demo '{patient_key}' no encontrado.")
        
    with open(full_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@app.post("/api/v1/predict")
def predict_stratification(req: PredictionRequest):
    """
    Ejecuta la estratificación predictiva mediante la arquitectura híbrida (CNN 1D + XGBoost).
    Calcula probabilidades calibradas mediante Platt Scaling y explicabilidad SHAP TreeExplainer.
    Guarda el registro en el historial de SQLite.
    """
    try:
        eval_result = engine.evaluate_request(req)
        
        # Guardar en SQLite si es inferencia simple o extraer resultado del Modelo B
        record_id = None
        if req.model_type != "compare":
            res_item = eval_result
            record_id = save_screening(
                patient_id=req.patient_id,
                age=req.demographics.age,
                sex=req.demographics.sex,
                model_used=res_item["model_name"],
                stratum_name=res_item["stratum_name"],
                risk_level=res_item["risk_level"],
                prob_control=res_item["probabilities"]["control"],
                prob_moderado=res_item["probabilities"]["moderado"],
                prob_severo=res_item["probabilities"]["severo"],
                confidence_score=res_item["confidence_score"]
            )
            eval_result["screening_id"] = record_id
        else:
            res_b = eval_result["model_b"]
            record_id = save_screening(
                patient_id=req.patient_id,
                age=req.demographics.age,
                sex=req.demographics.sex,
                model_used="Comparativo (Modelo B vs Modelo A)",
                stratum_name=res_b["stratum_name"],
                risk_level=res_b["risk_level"],
                prob_control=res_b["probabilities"]["control"],
                prob_moderado=res_b["probabilities"]["moderado"],
                prob_severo=res_b["probabilities"]["severo"],
                confidence_score=res_b["confidence_score"]
            )
            eval_result["screening_id"] = record_id

        return eval_result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error en inferencia: {str(e)}")

@app.get("/api/v1/screenings")
def list_screenings():
    """
    Retorna el historial de evaluaciones clínicas realizadas.
    """
    history = get_all_screenings(limit=100)
    return history

@app.post("/api/v1/generate-report")
def create_pdf_report(req: PredictionRequest):
    """
    Genera el informe clínico médico oficial en formato PDF listo para impresión.
    """
    try:
        eval_result = engine.evaluate_request(req)
        res_to_print = eval_result["model_b"] if req.model_type == "compare" else eval_result
        
        filepath, filename = generate_clinical_pdf(
            patient_id=req.patient_id,
            age=req.demographics.age,
            sex=req.demographics.sex,
            model_name=res_to_print["model_name"],
            stratum_name=res_to_print["stratum_name"],
            risk_level=res_to_print["risk_level"],
            probabilities=res_to_print["probabilities"],
            shap_features=res_to_print["shap_top_features"]
        )
        
        download_url = f"/reports/{filename}"
        return {
            "status": "success",
            "filename": filename,
            "download_url": download_url,
            "patient_id": req.patient_id,
            "stratum_name": res_to_print["stratum_name"]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al generar PDF: {str(e)}")

@app.get("/api/v1/reports/{filename}")
def download_pdf_report(filename: str):
    """
    Descarga directa de un archivo PDF generado.
    """
    full_path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Archivo PDF no encontrado.")
    return FileResponse(
        path=full_path,
        media_type="application/pdf",
        filename=filename
    )

# Servir Frontend compilado si existe
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Si la ruta es parte de la API o docs, dejar pasar
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("reports"):
            raise HTTPException(status_code=404)
        
        # Archivo estático directo
        candidate = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(candidate) and os.path.isfile(candidate):
            return FileResponse(candidate)
        
        # Fallback para React SPA
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend no encontrado")
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "system": "Plataforma de Estratificación Predictiva de TDAH mediante Biomarcadores Oculares",
            "institution": "Universidad Nacional de San Agustín de Arequipa (UNSA)",
            "author": "Emerson Danny Mendoza Hilasaca",
            "year": 2026,
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
