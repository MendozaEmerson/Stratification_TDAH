import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import ScreeningPanel from './components/ScreeningPanel';
import ResultDashboard from './components/ResultDashboard';
import PatientsHistory from './components/PatientsHistory';
import ArchitectureView from './components/ArchitectureView';
import { predictStratification } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('screening');
  const [predictionResult, setPredictionResult] = useState(null);
  const [lastRequestPayload, setLastRequestPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRunScreening = async (payload) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      setLastRequestPayload(payload);
      const res = await predictStratification(payload);
      setPredictionResult(res);
      // Desplazar suavemente hacia los resultados
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al comunicarse con el servidor de inferencia.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    setLastRequestPayload(null);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-sm">
            <span><b>Error:</b> {errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'screening' && (
          <>
            <MetricCards />
            <ScreeningPanel
              onRunScreening={handleRunScreening}
              isLoading={isLoading}
            />
            {predictionResult && lastRequestPayload && (
              <ResultDashboard
                result={predictionResult}
                requestPayload={lastRequestPayload}
                onReset={handleReset}
              />
            )}
          </>
        )}

        {activeTab === 'history' && <PatientsHistory />}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-600">
            Universidad Nacional de San Agustín de Arequipa (UNSA) — 2026
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Tesis de Grado en Ingeniería de Sistemas: <i>Arquitectura híbrida basada en CNN 1D y XGBoost para la estratificación predictiva del TDAH mediante biomarcadores oculares</i>
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Autor: Emerson Danny Mendoza Hilasaca • Línea: Inteligencia Artificial y Ciencia de Datos Médicos
          </p>
        </div>
      </footer>
    </div>
  );
}

