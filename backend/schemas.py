"""
schemas.py
Modelos Pydantic para la API REST de la Plataforma de Estratificación TDAH.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GazePoint(BaseModel):
    t: float
    x: float
    y: float
    pupil: Optional[float] = 0.0

class PatientDemographics(BaseModel):
    age: float = Field(..., ge=4.0, le=25.0, description="Edad del paciente en años")
    sex: str = Field(..., description="'Masculino' o 'Femenino'")

class TabularFeaturesInput(BaseModel):
    X1_Age: Optional[float] = None
    X2_Sex: Optional[int] = None
    X3_Pupil_Mean_Z: Optional[float] = 0.0
    X4_Pupil_Std: Optional[float] = 0.0
    X5_Fix_Duration_ms: Optional[float] = 280.0
    X6_Fix_Frequency_hz: Optional[float] = 3.1
    X7_Sac_Amplitude_deg: Optional[float] = 4.2
    X8_Sac_Velocity_deg_s: Optional[float] = 210.0
    X9_Sac_Frequency_hz: Optional[float] = 3.1
    X10_SGE_Entropy: Optional[float] = 3.8
    X11_GTE_Entropy: Optional[float] = 4.1
    X12_Attentional_Deviation: Optional[float] = 1.2
    X13_Reaction_Time_ms: Optional[float] = 320.0
    X14_Task_Efficacy_pct: Optional[float] = 78.5
    X15_WMI_WISC: Optional[float] = Field(None, description="Índice WMI (WISC-IV) opcional para Modelo A")

class PredictionRequest(BaseModel):
    patient_id: str = Field(..., description="Identificador único del paciente")
    demographics: PatientDemographics
    model_type: str = Field("model_b", description="'model_b' (Autónomo), 'model_a' (Clínico WMI) o 'compare'")
    wmi_score: Optional[float] = Field(None, description="Puntaje WMI para Modelo A")
    tabular_features: Optional[TabularFeaturesInput] = None
    deep_latent_features: Optional[List[float]] = None
    gaze_trajectory: Optional[List[GazePoint]] = None

class ShapFeatureImpact(BaseModel):
    feature_name: str
    display_name: str
    value: float
    impact_class2: float  # Impacto log-odds hacia severidad
    direction: str        # 'Aumenta riesgo' o 'Protector / Reduce riesgo'

class StratificationResult(BaseModel):
    model_name: str
    predicted_class: int
    stratum_name: str
    risk_level: str
    probabilities: Dict[str, float]
    raw_probabilities: List[float]
    confidence_score: float
    brier_reliability: float
    shap_top_features: List[ShapFeatureImpact]

class ComparisonResult(BaseModel):
    patient_id: str
    model_b: StratificationResult
    model_a: Optional[StratificationResult] = None
    wmi_influence_comment: str
    hypothesis_c4_validated: bool

class ScreeningHistoryItem(BaseModel):
    id: int
    patient_id: str
    timestamp: str
    age: float
    sex: str
    model_used: str
    stratum_name: str
    probability_severo: float
    pdf_report_path: Optional[str] = None

