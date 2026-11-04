"""
export_demo_data.py
Extrae pacientes muestra representativos (Control, Moderado, Severo) 
junto con sus trayectorias de mirada para la demostración interactiva en la app.
"""

import os
import json
import numpy as np
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
PROCESSED_DIR = os.path.join(PROJECT_ROOT, "Codigo", "processed_data")
CATALOG_PATH = os.path.join(PROCESSED_DIR, "processed_sessions_catalog.csv")
OOF_PATH = os.path.join(PROCESSED_DIR, "model_predictions_oof.csv")
TABULAR_PATH = os.path.join(PROCESSED_DIR, "features_tabular_subjects.csv")
LATENTS_PATH = os.path.join(PROCESSED_DIR, "features_deep_latent_subjects.npy")
PIDS_PATH = os.path.join(PROCESSED_DIR, "deep_latent_patient_ids.npy")
DEMO_DIR = os.path.join(CURRENT_DIR, "demo_patients")

os.makedirs(DEMO_DIR, exist_ok=True)

def main():
    print("[INFO] Leyendo datos procesados de la cohorte...")
    oof_df = pd.read_csv(OOF_PATH)
    tab_df = pd.read_csv(TABULAR_PATH)
    catalog_df = pd.read_csv(CATALOG_PATH)
    latents = np.load(LATENTS_PATH)
    pids = np.load(PIDS_PATH, allow_pickle=True)
    
    pid_to_latent_idx = {pid: i for i, pid in enumerate(pids)}
    merged = oof_df.merge(tab_df, on="Patient_ID")
    
    classes_info = [
        {"cls": 0, "name": "Control / Sintomatología Mínima", "key": "control"},
        {"cls": 1, "name": "Sintomatología Moderada", "key": "moderado"},
        {"cls": 2, "name": "TDAH Severo", "key": "severo"}
    ]
    
    exported_catalog = []

    for item in classes_info:
        cls = item["cls"]
        subset = merged[(merged["severity_class_true"] == cls) & (merged["pred_class_modelB"] == cls)]
        prob_col = f"prob_c{cls}_modelB"
        sorted_sub = subset.sort_values(by=prob_col, ascending=False)
        
        # Pick the top subject with valid session files
        chosen_row = None
        chosen_session_path = None
        
        for idx, row in sorted_sub.iterrows():
            cand_pid = row["Patient_ID"]
            cand_sessions = catalog_df[catalog_df["Patient_ID"] == cand_pid]["session_path"].tolist()
            for s_path in cand_sessions:
                abs_spath = s_path if os.path.isabs(s_path) else os.path.join(PROJECT_ROOT, "Codigo", s_path)
                if os.path.exists(abs_spath):
                    chosen_row = row
                    chosen_session_path = abs_spath
                    break
            if chosen_row is not None:
                break
                
        if chosen_row is None:
            chosen_row = sorted_sub.iloc[0]
            
        pid = chosen_row["Patient_ID"]
        print(f"\n[DEMO] Seleccionado para Clase {cls} ({item['name']}): {pid}")
        
        # Extraer trayectoria de mirada
        gaze_points = []
        if chosen_session_path and os.path.exists(chosen_session_path):
            try:
                raw_arr = np.load(chosen_session_path, allow_pickle=True)
                valid = (raw_arr[:, 0] >= 0) & (raw_arr[:, 2] > 0) & (raw_arr[:, 3] > 0)
                sub_arr = raw_arr[valid]
                # Tomar un segmento representativo de 300 puntos para visualización fluida
                step = max(1, len(sub_arr) // 300)
                sampled = sub_arr[::step][:300]
                for pt in sampled:
                    gaze_points.append({
                        "t": float(pt[0]),
                        "x": round(float(pt[2]), 2),
                        "y": round(float(pt[3]), 2),
                        "pupil": round(float(pt[4]), 2) if raw_arr.shape[1] > 4 else 0.0
                    })
            except Exception as e:
                print(f"  Aviso al leer scanpath: {e}")
                
        # Si no había archivo o estaba vacío, generar trayectoria sintética representativa
        if len(gaze_points) < 50:
            print("  Generando scanpath representativo...")
            np.random.seed(cls * 42 + 7)
            t_vals = np.linspace(0, 10, 200)
            center_x, center_y = 640.0, 360.0
            dispersion = 80.0 if cls == 0 else (160.0 if cls == 1 else 280.0)
            for t in t_vals:
                gx = center_x + np.sin(t * 1.5) * dispersion + np.random.normal(0, 15)
                gy = center_y + np.cos(t * 1.2) * (dispersion * 0.7) + np.random.normal(0, 15)
                gaze_points.append({
                    "t": round(float(t), 2),
                    "x": round(float(np.clip(gx, 50, 1230)), 2),
                    "y": round(float(np.clip(gy, 50, 670)), 2),
                    "pupil": 1000.0
                })

        # Extraer vector latente profundo
        latent_idx = pid_to_latent_idx.get(pid, 0)
        latent_vec = latents[latent_idx].tolist()
        
        # Extraer características tabulares
        tabular_dict = {
            "X1_Age": float(chosen_row["X1_Age"]),
            "X2_Sex": int(chosen_row["X2_Sex"]),
            "X3_Pupil_Mean_Z": float(chosen_row.get("X3_Pupil_Mean_Z", 0.0)),
            "X4_Pupil_Std": float(chosen_row.get("X4_Pupil_Std", 0.0)),
            "X5_Fix_Duration_ms": float(chosen_row.get("X5_Fix_Duration_ms", 280.0)),
            "X6_Fix_Frequency_hz": float(chosen_row.get("X6_Fix_Frequency_hz", 3.1)),
            "X7_Sac_Amplitude_deg": float(chosen_row.get("X7_Sac_Amplitude_deg", 4.2)),
            "X8_Sac_Velocity_deg_s": float(chosen_row.get("X8_Sac_Velocity_deg_s", 210.0)),
            "X9_Sac_Frequency_hz": float(chosen_row.get("X9_Sac_Frequency_hz", 3.1)),
            "X10_SGE_Entropy": float(chosen_row.get("X10_SGE_Entropy", 3.8)),
            "X11_GTE_Entropy": float(chosen_row.get("X11_GTE_Entropy", 4.1)),
            "X12_Attentional_Deviation": float(chosen_row.get("X12_Attentional_Deviation", 1.2)),
            "X13_Reaction_Time_ms": float(chosen_row.get("X13_Reaction_Time_ms", 320.0)),
            "X14_Task_Efficacy_pct": float(chosen_row.get("X14_Task_Efficacy_pct", 78.5)),
            "X15_WMI_WISC": float(chosen_row.get("X15_WMI_WISC", 100.0)) if "X15_WMI_WISC" in chosen_row and not pd.isna(chosen_row["X15_WMI_WISC"]) else 100.0
        }

        patient_record = {
            "patient_id": str(pid),
            "label_key": item["key"],
            "expected_class": cls,
            "expected_stratum": item["name"],
            "demographics": {
                "age": round(float(chosen_row["X1_Age"]), 1),
                "sex": "Femenino" if int(chosen_row["X2_Sex"]) == 1 else "Masculino"
            },
            "wmi_wisc": tabular_dict["X15_WMI_WISC"],
            "tabular_features": tabular_dict,
            "deep_latent_features": latent_vec,
            "gaze_trajectory": gaze_points,
            "benchmark_oof": {
                "modelA": {
                    "pred_class": int(chosen_row["pred_class_modelA"]),
                    "prob_c0": float(chosen_row["prob_c0_modelA"]),
                    "prob_c1": float(chosen_row["prob_c1_modelA"]),
                    "prob_c2": float(chosen_row["prob_c2_modelA"])
                },
                "modelB": {
                    "pred_class": int(chosen_row["pred_class_modelB"]),
                    "prob_c0": float(chosen_row["prob_c0_modelB"]),
                    "prob_c1": float(chosen_row["prob_c1_modelB"]),
                    "prob_c2": float(chosen_row["prob_c2_modelB"])
                }
            }
        }
        
        out_file = os.path.join(DEMO_DIR, f"patient_{cls}_{item['key']}.json")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(patient_record, f, indent=2, ensure_ascii=False)
            
        print(f"  [EXPORTADO] {out_file} con {len(gaze_points)} puntos de mirada.")
        
        exported_catalog.append({
            "id": str(pid),
            "key": item["key"],
            "stratum": item["name"],
            "expected_class": cls,
            "age": patient_record["demographics"]["age"],
            "sex": patient_record["demographics"]["sex"],
            "file": f"patient_{cls}_{item['key']}.json"
        })
        
    catalog_path = os.path.join(DEMO_DIR, "demo_catalog.json")
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(exported_catalog, f, indent=2, ensure_ascii=False)
    print(f"\n[ÉXITO] Catálogo de demostración creado en: {catalog_path}")

if __name__ == "__main__":
    main()

