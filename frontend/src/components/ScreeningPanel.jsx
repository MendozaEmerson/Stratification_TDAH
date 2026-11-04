import React, { useState } from 'react';
import { User, Sparkles, Upload, PlayCircle, Scale, Eye, Sliders } from 'lucide-react';
import { fetchDemoPatientDetail } from '../services/api';

export default function ScreeningPanel({ onRunScreening, isLoading }) {
  const [modelType, setModelType] = useState('model_b'); // 'model_b', 'model_a', 'compare'
  const [patientId, setPatientId] = useState('PAC-DEMO-01');
  const [age, setAge] = useState(9.5);
  const [sex, setSex] = useState('Masculino');
  const [wmiScore, setWmiScore] = useState(85.0);
  const [activeDemoKey, setActiveDemoKey] = useState(null);
  const [loadedPatientData, setLoadedPatientData] = useState(null);

  // Cargar caso demo curado
  const handleLoadDemo = async (key) => {
    try {
      setActiveDemoKey(key);
      const data = await fetchDemoPatientDetail(key);
      setLoadedPatientData(data);
      setPatientId(data.patient_id);
      setAge(data.demographics.age);
      setSex(data.demographics.sex);
      if (data.wmi_wisc) setWmiScore(data.wmi_wisc);
    } catch (err) {
      alert(`Error al cargar caso demo: ${err.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      patient_id: patientId,
      demographics: {
        age: parseFloat(age),
        sex: sex
      },
      model_type: modelType,
      wmi_score: modelType !== 'model_b' ? parseFloat(wmiScore) : null,
      tabular_features: loadedPatientData ? loadedPatientData.tabular_features : null,
      deep_latent_features: loadedPatientData ? loadedPatientData.deep_latent_features : null,
      gaze_trajectory: loadedPatientData ? loadedPatientData.gaze_trajectory : null
    };

    onRunScreening(payload);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm mb-6">
      {/* Selector de Modelo / Estrategia */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          1. Selección de Modelo de Inferencia y Estrategia
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setModelType('model_b')}
            className={`flex flex-col p-3 rounded-lg border text-left transition-all ${
              modelType === 'model_b'
                ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Eye className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-xs text-slate-900">
                Modelo B (Autónomo)
              </span>
              <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.2 rounded font-semibold ml-auto">
                Recomendado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              100% Eye-Tracking + Demografía. Ideal para telemedicina y colegios.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModelType('model_a')}
            className={`flex flex-col p-3 rounded-lg border text-left transition-all ${
              modelType === 'model_a'
                ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-xs text-slate-900">
                Modelo A (Clínico Integral)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Incluye prueba cognitiva WISC-IV (WMI). Para hospitales especializados.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModelType('compare')}
            className={`flex flex-col p-3 rounded-lg border text-left transition-all ${
              modelType === 'compare'
                ? 'border-purple-500 bg-purple-50/70 shadow-sm ring-1 ring-purple-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Scale className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-xs text-slate-900">
                Modo Comparativo (A vs B)
              </span>
              <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-semibold ml-auto">
                Tesis C4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Ejecuta ambos y demuestra el aporte marginal nulo del test WISC-IV.
            </p>
          </button>
        </div>
      </div>

      {/* Carga Rápida de Casos Demo del Biobanco HBN */}
      <div className="mb-5 bg-slate-50/80 p-3 rounded-lg border border-slate-200/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
            Casos de Prueba Reales Pre-cargados (Biobanco HBN - N = 1,218):
          </span>
          <span className="text-[11px] text-slate-400">1 Clic para evaluar</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleLoadDemo('control')}
            className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
              activeDemoKey === 'control'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
            }`}
          >
            🟢 <b>Caso 1: Control / Mínima</b>
            <div className="text-[10px] text-slate-500 font-mono">NDARZF602KU6 (9.3a, F)</div>
          </button>

          <button
            type="button"
            onClick={() => handleLoadDemo('moderado')}
            className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
              activeDemoKey === 'moderado'
                ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            🟡 <b>Caso 2: Sintomatología Moderada</b>
            <div className="text-[10px] text-slate-500 font-mono">NDARXP717YMH (8.7a, M)</div>
          </button>

          <button
            type="button"
            onClick={() => handleLoadDemo('severo')}
            className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
              activeDemoKey === 'severo'
                ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
            }`}
          >
            🔴 <b>Caso 3: TDAH Severo</b>
            <div className="text-[10px] text-slate-500 font-mono">NDARDF373ZDW (11.2a, M)</div>
          </button>
        </div>
      </div>

      {/* Formulario de Parámetros del Paciente */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Código / ID Paciente
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Edad Cronológica (años)
            </label>
            <input
              type="number"
              step="0.1"
              min="4"
              max="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sexo Biológico
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>WISC-IV WMI (Memoria)</span>
              {modelType === 'model_b' && (
                <span className="text-[10px] text-slate-400 font-normal">Ignorado (Modelo B)</span>
              )}
            </label>
            <input
              type="number"
              step="1"
              min="40"
              max="160"
              value={wmiScore}
              onChange={(e) => setWmiScore(e.target.value)}
              disabled={modelType === 'model_b'}
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                modelType === 'model_b'
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-indigo-300 focus:ring-2 focus:ring-indigo-500 text-indigo-900 font-semibold'
              }`}
            />
          </div>
        </div>

        {/* Botón de Ejecución */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {loadedPatientData ? (
              <span className="text-emerald-700 font-medium">
                ✓ Registro ocular sincronizado ({loadedPatientData.gaze_trajectory?.length || 0} coordenadas I-DT)
              </span>
            ) : (
              <span className="text-slate-400">
                Seleccione un caso o ingrese datos manuales
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-700 text-white hover:from-sky-700 hover:to-indigo-800 transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                <span>Ejecutando Inferencia Híbrida...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Ejecutar Estratificación Predictiva</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

