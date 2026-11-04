import React, { useState } from 'react';
import { Download, AlertTriangle, CheckCircle, Clock, ShieldAlert, Sparkles, Scale, RefreshCw } from 'lucide-react';
import GazeViewer from './GazeViewer';
import ShapWaterfall from './ShapWaterfall';
import { generateClinicalReport } from '../services/api';

export default function ResultDashboard({ result, requestPayload, onReset }) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!result) return null;

  const isCompare = !!result.model_b && !!result.model_a;
  const primaryResult = isCompare ? result.model_b : result;

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const res = await generateClinicalReport(requestPayload);
      if (res.download_url) {
        window.open(`http://localhost:8000${res.download_url}`, '_blank');
      }
    } catch (err) {
      alert(`Error al generar el informe PDF: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Colores según severidad
  const stratum = primaryResult.stratum_name;
  let theme = {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    badgeBg: 'bg-emerald-600',
    barColor: 'bg-emerald-500',
    icon: CheckCircle
  };

  if (stratum.includes('Severo')) {
    theme = {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-800',
      badgeBg: 'bg-rose-600',
      barColor: 'bg-rose-500',
      icon: ShieldAlert
    };
  } else if (stratum.includes('Moderado')) {
    theme = {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-800',
      badgeBg: 'bg-amber-600',
      barColor: 'bg-amber-500',
      icon: AlertTriangle
    };
  }

  const IconComponent = theme.icon;

  return (
    <div className="space-y-6">
      {/* Tarjeta de Diagnóstico Principal */}
      <div className={`rounded-xl border ${theme.border} ${theme.bg} p-6 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl ${theme.badgeBg} text-white shadow-md`}>
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Resultado de la Estratificación Predictiva
              </span>
              <h2 className={`text-2xl font-black ${theme.text} tracking-tight`}>
                {stratum.toUpperCase()}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                <span>Paciente: <b>{requestPayload.patient_id}</b></span>
                <span>•</span>
                <span>Edad: <b>{requestPayload.demographics.age} años</b></span>
                <span>•</span>
                <span>Sexo: <b>{requestPayload.demographics.sex}</b></span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{primaryResult.model_name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-sky-600" />
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Ficha Oficial (PDF)'}</span>
            </button>
            <button
              onClick={onReset}
              className="p-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-transparent hover:border-slate-300 transition-colors"
              title="Nueva Evaluación"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Distribución de Probabilidades Calibradas */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Distribución de Probabilidades Calibradas (Escalamiento de Platt):
            </span>
            <span className="text-xs font-mono text-slate-500">
              Certeza: <b>{primaryResult.confidence_score}%</b> (Brier = {primaryResult.brier_reliability})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Control */}
            <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-emerald-800">Control / Mínima</span>
                <span className="font-mono font-bold text-emerald-700">
                  {primaryResult.probabilities.control}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${primaryResult.probabilities.control}%` }}
                />
              </div>
            </div>

            {/* Moderado */}
            <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-amber-800">Moderado</span>
                <span className="font-mono font-bold text-amber-700">
                  {primaryResult.probabilities.moderado}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${primaryResult.probabilities.moderado}%` }}
                />
              </div>
            </div>

            {/* Severo */}
            <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-rose-800">TDAH Severo</span>
                <span className="font-mono font-bold text-rose-700">
                  {primaryResult.probabilities.severo}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${primaryResult.probabilities.severo}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel Comparativo si está en Modo Compare */}
        {isCompare && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 bg-white/70 p-4 rounded-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-900 mb-2">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Contraste Clínico en Vivo: Modelo B (Autónomo) vs. Modelo A (Clínico con WMI)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                <div className="font-bold text-slate-800 mb-1">Modelo B (Solo Ojos + Demografía)</div>
                <div className="text-slate-600">Estrato: <b>{result.model_b.stratum_name}</b></div>
                <div className="text-slate-600">Probabilidad Severidad: <b>{result.model_b.probabilities.severo}%</b></div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                <div className="font-bold text-slate-800 mb-1">Modelo A (+ Test WISC-IV WMI = {requestPayload.wmi_score})</div>
                <div className="text-slate-600">Estrato: <b>{result.model_a.stratum_name}</b></div>
                <div className="text-slate-600">Probabilidad Severidad: <b>{result.model_a.probabilities.severo}%</b></div>
              </div>
            </div>
            <p className="mt-2 text-xs text-purple-900/90 leading-relaxed bg-purple-50 p-2.5 rounded-lg border border-purple-200/60">
              💡 <b>Conclusión Experimental (Brecha C4):</b> {result.wmi_influence_comment}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Visualizador de Mirada y SHAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GazeViewer
          gazeTrajectory={requestPayload.gaze_trajectory || []}
          stratumName={primaryResult.stratum_name}
        />
        <ShapWaterfall
          shapFeatures={primaryResult.shap_top_features || []}
        />
      </div>
    </div>
  );
}

