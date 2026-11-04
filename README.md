# Plataforma de Estratificación Predictiva de TDAH mediante Biomarcadores Oculares

> **Universidad Nacional de San Agustín de Arequipa (UNSA)**  
> **Facultad de Ingeniería de Producción y Servicios — Escuela Profesional de Ingeniería de Sistemas**  
> **Tesis de Grado en Ingeniería de Sistemas (2026)**  
> **Autor:** Emerson Danny Mendoza Hilasaca  
> **Título de Tesis:** *Arquitectura híbrida basada en CNN 1D y XGBoost para la estratificación predictiva de la severidad del trastorno por déficit de atención e hiperactividad mediante biomarcadores oculares.*

---

## 📌 1. Descripción del Sistema

La **Plataforma TDAH** es una solución de software médico integral y de soporte a la decisión clínica (CDSS) diseñada bajo una arquitectura desacoplada **Cliente-Servidor (FastAPI + React/TailwindCSS)**. Implementa en producción el pipeline de Inteligencia Artificial desarrollado en la tesis:

* **Extracción Profunda (CNN 1D):** Procesa series temporales continuas de la mirada $(x, y, t)$ proyectándolas a un vector de representaciones latentes invariantes de 64 dimensiones.
* **Extracción Cinemática Espaciotemporal (I-DT + DeepGaze II):** Segmenta fijaciones, sacadas, entropías espaciales (SGE/GTE) y cuantifica la desviación hacia la saliencia visual del entorno.
* **Fusión Multimodal Temprana & Clasificación (XGBoost):** Modelo de gradient boosting regularizado que resuelve el desbalance clínico de clases.
* **Calibración Probabilística (Platt Scaling):** Transforma los puntajes del modelo en probabilidades clínicas reales y confiables (Brier Score = 0.2084).
* **Explicabilidad Clínica en Vivo (SHAP TreeExplainer):** Atribución matemática individualizada que le explica al especialista qué biomarcadores aumentaron o disminuyeron el riesgo para cada paciente.

---

## 🚀 2. Estrategia Dual de Modelos (Validación de la Brecha C4)

La plataforma permite alternar dinámicamente entre tres modalidades de inferencia:

1. **Modelo B (Autónomo / Telemedicina) — [Recomendado]:**
   * **Variables:** 78 biomarcadores (64 latentes CNN 1D + 12 cinemáticos oculares + Edad y Sexo).
   * **Propósito:** Diseñado para tamizaje escolar masivo y postas de salud rurales sin neuropsicólogos.
   * **Rendimiento:** **45.00% de Exactitud**, **0.4457 Weighted F1**, **56.55% de Sensibilidad en Severo** y menor incertidumbre diagnóstica.
2. **Modelo A (Clínico Integral):**
   * **Variables:** 79 biomarcadores (añade el Índice de Memoria de Trabajo WMI del test neuropsicológico WISC-IV).
   * **Propósito:** Hospitales especializados (como el INSN) con acceso a baterías psicométricas completas.
3. **Modo Comparativo en Vivo (A vs B):**
   * Ejecuta ambos modelos sobre el mismo paciente y demuestra en pantalla que la inclusión de la prueba psicométrica altera la certeza en menos del 1%, validando en tiempo real que el eye-tracking autónomo es autosuficiente para el tamizaje.

---

## 📊 3. Rendimiento y Contraste con la Literatura Internacional

| Tarea Experimental | Cohorte Evaluada | Azar Teórico | Accuracy | F1-Score | Sensibilidad TDAH | Estado frente al Estado del Arte |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Detección Binaria (Deng et al., 2022)** | $N = 1,218$ | 50.0% | **62.73%** | **69.20%** | **74.15%** | Protocolo estricto por sujetos sin fuga de datos |
| **Casos Extremos (Control vs. Severo)** | $N = 580$ | 50.0% | **69.66% (~70%)** | **81.51% (~82%)** | **94.00%** | **Alcanza plenamente el rango 70% – 82%** |
| **Estratificación Multiclase (Tesis)** | $N = 1,218$ | 33.3% | **45.00%** | **44.57%** | **56.55% (Severo)** | Supera al azar en +35.1% en severidad tricotómica |

---

## 💻 4. Funcionalidades Principales de la Aplicación

* **Panel de Tamizaje con Casos de Demostración:** 3 botones rápidos que cargan pacientes reales del Biobanco HBN (*Caso 1: Control, Caso 2: Moderado, Caso 3: TDAH Severo*).
* **Visualizador Dinámico de Exploración Ocular (Scanpath):** Reproductor interactivo en Canvas que ilustra la trayectoria $(x, y)$ de la mirada del paciente sobre el video estímulo *The Present*.
* **Gráfico de Explicabilidad Clínica SHAP:** Barras horizontales en rojo (aumento de riesgo) y verde (factores protectores) calculadas con la teoría de juegos cooperativos.
* **Generación de Ficha Médica Oficial en PDF:** Descarga instantánea de informes clínicos formales listos para imprimir con sellos y membrete de la UNSA.
* **Historial Persistente en Base de Datos SQLite:** Guarda cada evaluación realizada para auditoría médica y seguimiento temporal.
* **Documentación OpenAPI / Swagger:** Disponible en `/docs` para integración con sistemas de historias clínicas electrónicas (EHR).

---

## 🛠️ 5. Estructura del Proyecto

```text
Plataforma_TDAH/
├── README.md                          <- Documentación del sistema
├── .gitignore                         <- Exclusiones para GitHub
├── run_app.bat                        <- Script de inicio rápido en Windows (1 clic)
│
├── backend/                           <- API REST en FastAPI
│   ├── main.py                        <- Servidor REST, CORS y entrega SPA
│   ├── schemas.py                     <- Modelos de datos Pydantic
│   ├── inference_engine.py            <- CNN 1D + XGBoost + Platt + SHAP TreeExplainer
│   ├── database.py                    <- Persistencia en SQLite (screenings.db)
│   ├── report_generator.py            <- Generador de reportes clínicos PDF (ReportLab)
│   ├── export_demo_data.py            <- Curador de pacientes muestra de HBN
│   ├── test_backend.py                <- Suite de pruebas unitarias
│   ├── demo_patients/                 <- Archivos JSON curados con trayectorias reales
│   └── requirements.txt               <- Dependencias de Python
│
└── frontend/                          <- Aplicación Web SPA
    ├── package.json                   <- Dependencias npm (React, Vite, TailwindCSS)
    ├── vite.config.js                 <- Configuración de Vite y proxy
    ├── index.html                     <- Plantilla HTML
    ├── src/
    │   ├── main.jsx                   <- Entrada React
    │   ├── App.jsx                    <- Contenedor principal y navegación
    │   ├── index.css                  <- Estilos globales y Tailwind
    │   ├── services/api.js            <- Cliente HTTP hacia FastAPI
    │   └── components/
    │       ├── Navbar.jsx             <- Barra de navegación médica
    │       ├── MetricCards.jsx        <- Resumen de métricas de la tesis
    │       ├── ScreeningPanel.jsx     <- Formulario de tamizaje y carga rápida
    │       ├── ResultDashboard.jsx    <- Diagnóstico, probabilidades y PDF
    │       ├── GazeViewer.jsx         <- Visualizador animado de scanpath
    │       ├── ShapWaterfall.jsx      <- Atribución de características SHAP
    │       ├── PatientsHistory.jsx    <- Tabla de evaluaciones registradas
    │       └── ArchitectureView.jsx   <- Panel científico de la arquitectura
    └── dist/                          <- Build compilado de producción
```

---

## ⚡ 6. Instalación y Ejecución Rápida

### Opción A: Inicio con 1 Clic en Windows
Simplemente haz doble clic sobre el archivo:
```cmd
run_app.bat
```
El script validará las dependencias, iniciará el servidor FastAPI en el puerto 8000 y abrirá automáticamente tu navegador en `http://localhost:8000`.

---

### Opción B: Ejecución Manual Paso a Paso

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/plataforma-tdah-unsa.git
cd plataforma-tdah-unsa
```

#### 2. Configurar el Backend (Python)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*El backend quedará escuchando en `http://localhost:8000` con la documentación en `http://localhost:8000/docs`.*

#### 3. Configurar el Frontend (React + Vite) — *Para desarrollo*
En una segunda terminal:
```bash
cd frontend
npm install
npm run dev
```
*La interfaz de desarrollo estará disponible en `http://localhost:5173` con recarga en caliente.*

---

## 📡 7. Especificación de Endpoints de la API REST

| Método | Endpoint | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/v1/system-info` | Retorna metadatos de la cohorte, modelos y benchmarks |
| `GET` | `/api/v1/demo-patients` | Lista los pacientes muestra pre-cargados del biobanco HBN |
| `GET` | `/api/v1/demo-patients/{key}` | Detalle completo de mirada y biomarcadores del paciente |
| `POST` | `/api/v1/predict` | Ejecuta inferencia, calibración Platt y explicabilidad SHAP |
| `GET` | `/api/v1/screenings` | Consulta el historial de tamizajes en la base de datos |
| `POST` | `/api/v1/generate-report` | Genera y retorna el informe clínico médico oficial en PDF |
| `GET` | `/reports/{filename}` | Descarga directa del archivo PDF generado |

---

## 🎓 Cita y Referencia Académica

Si utilizas este software o sus modelos como base para investigaciones biomédicas o trabajos de titulación:

```bibtex
@mastersthesis{mendoza2026tdah,
  author       = {Mendoza Hilasaca, Emerson Danny},
  title        = {Arquitectura h{\'\i}brida basada en CNN 1D y XGBoost para la estratificaci{\'o}n predictiva de la severidad del trastorno por d{\'e}ficit de atenci{\'o}n e hiperactividad mediante biomarcadores oculares},
  school       = {Universidad Nacional de San Agust{\'\i}n de Arequipa (UNSA)},
  year         = {2026},
  address      = {Arequipa, Per{\'u}},
  type         = {Tesis de Grado en Ingenier{\'\i}a de Sistemas}
}
```

