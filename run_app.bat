@echo off
TITLE Plataforma TDAH - UNSA 2026
echo ==============================================================================
echo     PLATAFORMA DE ESTRATIFICACION PREDICTIVA DE TDAH (UNSA 2026)
echo     Arquitectura Hibrida CNN 1D + XGBoost - Biomarcadores Oculares
echo     Autor: Emerson Danny Mendoza Hilasaca
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando dependencias de Python...
python -c "import fastapi, uvicorn, torch, xgboost, shap, reportlab; print('Dependencias de Python: OK')"
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Faltan dependencias. Instalando requirements...
    pip install -r backend/requirements.txt
)

echo.
echo [2/3] Iniciando Servidor Backend FastAPI (Puerto 8000)...
echo       - Web App:      http://localhost:8000
echo       - Swagger API:  http://localhost:8000/docs
echo.

start "" "http://localhost:8000"

cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

pause

