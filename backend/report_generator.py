"""
report_generator.py
Generador de Informes Clínicos Oficiales en PDF utilizando ReportLab.
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(CURRENT_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_clinical_pdf(patient_id, age, sex, model_name, stratum_name, risk_level,
                          probabilities, shap_features, tabular_summary=None):
    """
    Genera un informe clínico médico en formato PDF formal.
    """
    filename = f"Informe_TDAH_{patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=35,
        bottomMargin=35
    )
    
    styles = getSampleStyleSheet()
    
    # Estilos personalizados
    header_univ_style = ParagraphStyle(
        "UnivHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0D3B66")
    )
    
    header_fac_style = ParagraphStyle(
        "FacHeader",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4A5568")
    )
    
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1A365D"),
        spaceAfter=10
    )
    
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=13,
        textColor=colors.HexColor("#0D3B66"),
        spaceBefore=8,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2D3748")
    )

    story = []
    
    # 1. Cabecera Institucional
    story.append(Paragraph("UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA", header_univ_style))
    story.append(Paragraph("FACULTAD DE INGENIERÍA DE PRODUCCIÓN Y SERVICIOS | ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS", header_fac_style))
    story.append(Paragraph("Laboratorio de Inteligencia Artificial y Biomarcadores Oculares", header_fac_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0D3B66"), spaceAfter=12))
    
    # 2. Título del Reporte
    story.append(Paragraph("INFORME CLÍNICO DE ESTRATIFICACIÓN PREDICTIVA DE TDAH", title_style))
    story.append(Paragraph(f"<b>Fecha y Hora de Emisión:</b> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')} | <b>Ficha:</b> INF-TDAH-{patient_id[:8]}", ParagraphStyle("DateSub", parent=body_style, alignment=TA_CENTER, textColor=colors.HexColor("#718096"))))
    story.append(Spacer(1, 10))
    
    # 3. Datos del Paciente
    story.append(Paragraph("1. INFORMACIÓN DEL PACIENTE Y PROTOCOLO", section_heading))
    patient_table_data = [
        [
            Paragraph("<b>Identificador (ID):</b>", body_style),
            Paragraph(str(patient_id), body_style),
            Paragraph("<b>Edad Cronológica:</b>", body_style),
            Paragraph(f"{age} años", body_style)
        ],
        [
            Paragraph("<b>Sexo Biológico:</b>", body_style),
            Paragraph(str(sex), body_style),
            Paragraph("<b>Modelo de Inferencia:</b>", body_style),
            Paragraph(str(model_name), body_style)
        ]
    ]
    t_patient = Table(patient_table_data, colWidths=[120, 140, 120, 150])
    t_patient.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_patient)
    story.append(Spacer(1, 12))
    
    # 4. Resultado Diagnóstico y Estratificación
    story.append(Paragraph("2. DIAGNÓSTICO PREDICTIVO ESTRATIFICADO", section_heading))
    
    # Color según severidad
    if "Severo" in stratum_name:
        bg_alert = colors.HexColor("#FFF5F5")
        border_alert = colors.HexColor("#E53E3E")
        text_color = "#C53030"
    elif "Moderado" in stratum_name:
        bg_alert = colors.HexColor("#FFFAF0")
        border_alert = colors.HexColor("#DD6B20")
        text_color = "#C05621"
    else:
        bg_alert = colors.HexColor("#F0FFF4")
        border_alert = colors.HexColor("#38A169")
        text_color = "#276749"
        
    diag_box_data = [
        [
            Paragraph(
                f"<font size=12 color='{text_color}'><b>ESTRATO CLÍNICO IDENTIFICADO: {stratum_name.upper()}</b></font><br/>"
                f"<font size=9 color='#4A5568'>Nivel de Riesgo Clínico: <b>{risk_level}</b> | Calibración de Probabilidades mediante Escalamiento de Platt (Brier = 0.2084)</font>",
                body_style
            )
        ]
    ]
    t_diag = Table(diag_box_data, colWidths=[530])
    t_diag.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_alert),
        ('BOX', (0,0), (-1,-1), 1.5, border_alert),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_diag)
    story.append(Spacer(1, 8))
    
    # 5. Tabla de Probabilidades Calibradas
    prob_data = [
        [
            Paragraph("<b>Estrato Clásico</b>", body_style),
            Paragraph("<b>Probabilidad Calibrada (%)</b>", body_style),
            Paragraph("<b>Interpretación Clínica</b>", body_style)
        ],
        [
            Paragraph("Control / Mínima", body_style),
            Paragraph(f"<b>{probabilities.get('control', 0.0)}%</b>", body_style),
            Paragraph("Patrón oculomotor típico sin disfunción de fijación.", body_style)
        ],
        [
            Paragraph("Sintomatología Moderada", body_style),
            Paragraph(f"<b>{probabilities.get('moderado', 0.0)}%</b>", body_style),
            Paragraph("Franja de transición atencional (seguimiento recomendado).", body_style)
        ],
        [
            Paragraph("TDAH Severo", body_style),
            Paragraph(f"<b>{probabilities.get('severo', 0.0)}%</b>", body_style),
            Paragraph("Marcada fragmentación sacádica y captura atencional involuntaria.", body_style)
        ]
    ]
    t_prob = Table(prob_data, colWidths=[140, 130, 260])
    t_prob.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('ALIGN', (1,1), (1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_prob)
    story.append(Spacer(1, 12))
    
    # 6. Explicabilidad Clínica mediante SHAP TreeExplainer
    story.append(Paragraph("3. EXPLICABILIDAD CLÍNICA (ATRIBUCIÓN DE BIOMARCADORES SHAP)", section_heading))
    story.append(Paragraph(
        "Los siguientes biomarcadores tuvieron la mayor ponderación matemática en el árbol de decisión "
        "para determinar la severidad sintomática de este paciente:",
        ParagraphStyle("SubText", parent=body_style, textColor=colors.HexColor("#4A5568"))
    ))
    story.append(Spacer(1, 4))
    
    shap_rows = [
        [
            Paragraph("<b>Biomarcador Evaluado</b>", body_style),
            Paragraph("<b>Valor Observado</b>", body_style),
            Paragraph("<b>Impacto hacia Severidad (SHAP)</b>", body_style),
            Paragraph("<b>Dirección del Efecto</b>", body_style)
        ]
    ]
    for feat in shap_features[:5]:
        val_str = str(feat["value"])
        imp_val = feat["impact_class2"]
        direction_str = feat["direction"]
        dir_color = "#C53030" if imp_val > 0 else "#276749"
        
        shap_rows.append([
            Paragraph(feat["display_name"], body_style),
            Paragraph(val_str, body_style),
            Paragraph(f"{imp_val:+.4f}", body_style),
            Paragraph(f"<font color='{dir_color}'><b>{direction_str}</b></font>", body_style)
        ])
        
    t_shap = Table(shap_rows, colWidths=[190, 80, 110, 150])
    t_shap.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('ALIGN', (1,1), (2,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_shap)
    story.append(Spacer(1, 16))
    
    # 7. Nota Legal y Firma
    disclaimer_text = (
        "<b>Nota de Responsabilidad Médica:</b> El presente informe es un resultado de asistencia diagnóstica "
        "computacional basado en aprendizaje automático híbrido (CNN 1D + XGBoost) y no sustituye la evaluación "
        "clínica exhaustiva por un médico psiquiatra infantil o neuropediatra certificado. Válido como herramienta "
        "de tamizaje escolar y soporte a la decisión médica."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle("Disc", parent=body_style, fontSize=8, leading=10, textColor=colors.HexColor("#718096"), alignment=TA_JUSTIFY)))
    story.append(Spacer(1, 25))
    
    # Firmas
    signatures_data = [
        [
            Paragraph("________________________________________<br/><b>Evaluador Responsable</b><br/>Ingeniería de Sistemas - UNSA", ParagraphStyle("Sig1", parent=body_style, alignment=TA_CENTER)),
            Paragraph("________________________________________<br/><b>Especialista Clínico / Validador</b><br/>Neurología Pediátrica / Psiquiatría", ParagraphStyle("Sig2", parent=body_style, alignment=TA_CENTER))
        ]
    ]
    t_sig = Table(signatures_data, colWidths=[265, 265])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_sig)
    
    doc.build(story)
    return filepath, filename

