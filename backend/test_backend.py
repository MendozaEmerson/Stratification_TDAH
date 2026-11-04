"""
test_backend.py
Prueba directa de inferencia, comparación de modelos, persistencia y reporte PDF.
"""

import os
import json
from schemas import PredictionRequest, PatientDemographics, TabularFeaturesInput
from inference_engine import engine
from database import get_all_screenings, save_screening
from report_generator import generate_clinical_pdf

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEMO_DIR = os.path.join(CURRENT_DIR, "demo_patients")

def test_direct():
    print("[TEST 1] Verificando catálogo de pacientes demo...")
    catalog_path = os.path.join(DEMO_DIR, "demo_catalog.json")
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    print(f"  OK: {len(catalog)} pacientes encontrados en catálogo.")

    print("\n[TEST 2] Probando inferencia con Paciente Severo (Modelo B - Autónomo)...")
    with open(os.path.join(DEMO_DIR, "patient_2_severo.json"), "r", encoding="utf-8") as f:
        severo_data = json.load(f)

    req_severo = PredictionRequest(
        patient_id=severo_data["patient_id"],
        demographics=PatientDemographics(**severo_data["demographics"]),
        model_type="model_b",
        tabular_features=TabularFeaturesInput(**severo_data["tabular_features"]),
        deep_latent_features=severo_data["deep_latent_features"]
    )

    res_severo = engine.evaluate_request(req_severo)
    print("  Resultado:", res_severo["stratum_name"])
    print("  Probabilidades:", res_severo["probabilities"])
    print("  Top SHAP:", [f["display_name"] + f" ({f['impact_class2']:+.3f})" for f in res_severo["shap_top_features"][:3]])
    assert res_severo["predicted_class"] == 2

    print("\n[TEST 3] Probando Modo Comparativo (Modelo A vs Modelo B) en Paciente Severo...")
    req_compare = PredictionRequest(
        patient_id=severo_data["patient_id"],
        demographics=PatientDemographics(**severo_data["demographics"]),
        model_type="compare",
        wmi_score=85.0,
        tabular_features=TabularFeaturesInput(**severo_data["tabular_features"]),
        deep_latent_features=severo_data["deep_latent_features"]
    )
    res_compare = engine.evaluate_request(req_compare)
    print("  Modelo B Prob Severo:", res_compare["model_b"]["probabilities"]["severo"], "%")
    print("  Modelo A Prob Severo:", res_compare["model_a"]["probabilities"]["severo"], "%")
    print("  Comentario Clínico:", res_compare["wmi_influence_comment"])
    assert res_compare["hypothesis_c4_validated"] is True

    print("\n[TEST 4] Probando Generación de Reporte PDF Oficial...")
    filepath, filename = generate_clinical_pdf(
        patient_id=req_severo.patient_id,
        age=req_severo.demographics.age,
        sex=req_severo.demographics.sex,
        model_name=res_severo["model_name"],
        stratum_name=res_severo["stratum_name"],
        risk_level=res_severo["risk_level"],
        probabilities=res_severo["probabilities"],
        shap_features=res_severo["shap_top_features"]
    )
    assert os.path.exists(filepath)
    pdf_size_kb = os.path.getsize(filepath) / 1024
    print(f"  OK: Archivo PDF generado exitosamente: {filename} ({pdf_size_kb:.1f} KB)")

    print("\n[TEST 5] Probando Inserción y Consulta en Base de Datos SQLite...")
    rec_id = save_screening(
        patient_id=req_severo.patient_id,
        age=req_severo.demographics.age,
        sex=req_severo.demographics.sex,
        model_used=res_severo["model_name"],
        stratum_name=res_severo["stratum_name"],
        risk_level=res_severo["risk_level"],
        prob_control=res_severo["probabilities"]["control"],
        prob_moderado=res_severo["probabilities"]["moderado"],
        prob_severo=res_severo["probabilities"]["severo"],
        confidence_score=res_severo["confidence_score"],
        pdf_path=filepath
    )
    print(f"  OK: Registro guardado en SQLite con ID = {rec_id}")
    history = get_all_screenings()
    print(f"  OK: Total de registros en base de datos = {len(history)}")

    print("\n" + "="*70)
    print(" ¡TODAS LAS PRUEBAS UNITARIAS DEL MOTOR Y BACKEND PASARON CON ÉXITO!")
    print("="*70)

if __name__ == "__main__":
    test_direct()
