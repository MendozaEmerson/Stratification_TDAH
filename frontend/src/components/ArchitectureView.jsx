import React from 'react';
import { Layers, GitBranch, Cpu, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="space-y-6">
      {/* Resumen de Arquitectura Híbrida */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Arquitectura Híbrida Multimodal: CNN 1D + XGBoost
            </h2>
            <p className="text-xs text-slate-500">
              Diseño modular desacoplado en 6 capas con Fusión Multimodal Temprana (Brechas C2, C4, C5, C6 y C7)
            </p>
          </div>
        </div>

        {/* Diagrama de Flujo Visual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-6">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white inline-flex items-center justify-center mr-1.5 text-[10px]">1</span>
              Adquisición Ocular
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Series temporales multivariadas (x, y, pupila) de 1,218 participantes del biobanco HBN.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center mr-1.5 text-[10px]">2</span>
              Extracción Dual
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              <b>CNN 1D:</b> 64 latentes espaciotemporales.<br />
              <b>I-DT + DeepGaze II:</b> 14 métricas cinemáticas.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white inline-flex items-center justify-center mr-1.5 text-[10px]">3</span>
              Fusión & Clasificación
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              XGBoost regularizado (L1=0.8, L2=2.0) con submuestreo de características (0.60).
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center mr-1.5 text-[10px]">4</span>
              Calibración & SHAP
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Escalamiento de Platt (Brier = 0.2084) + explicabilidad local con SHAP TreeExplainer.
            </p>
          </div>
        </div>

        {/* Tabla Comparativa Oficial Modelo A vs Modelo B */}
        <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center">
          <GitBranch className="w-4 h-4 text-sky-600 mr-2" />
          Rendimiento Formal Multiclase (K = 5 Folds, Sujeto-Independiente)
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Modelo Evaluado</th>
                <th className="py-2.5 px-3">Variables</th>
                <th className="py-2.5 px-3 text-center">Macro F1</th>
                <th className="py-2.5 px-3 text-center">AUC-ROC OvO</th>
                <th className="py-2.5 px-3 text-center">Weighted F1</th>
                <th className="py-2.5 px-3 text-center">Exactitud (Accuracy)</th>
                <th className="py-2.5 px-3 text-center">Brier Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Modelo A (Clínico Integral)</td>
                <td className="py-2.5 px-3 text-slate-500">79 (CNN + Tab + WISC WMI)</td>
                <td className="py-2.5 px-3 text-center font-mono">0.3936 ± 0.0229</td>
                <td className="py-2.5 px-3 text-center font-mono">0.5698 ± 0.0292</td>
                <td className="py-2.5 px-3 text-center font-mono">0.4327 ± 0.0196</td>
                <td className="py-2.5 px-3 text-center font-mono">42.04%</td>
                <td className="py-2.5 px-3 text-center font-mono">0.2144</td>
              </tr>
              <tr className="bg-sky-50/50 hover:bg-sky-50 font-semibold text-sky-950">
                <td className="py-2.5 px-3 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
                  Modelo B (Autónomo / Telemedicina)
                </td>
                <td className="py-2.5 px-3 text-sky-700 font-normal">78 (100% Ocular + Demo)</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-700">0.3861 ± 0.0306</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-700">0.5682 ± 0.0295</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-700">0.4457 ± 0.0110</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-700">45.00% (+2.96%)</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">0.2084</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla de Contraste con la Literatura (70% - 82%) */}
        <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
          Contraste Empírico: Tareas Binarias de la Literatura vs. Estratificación Multiclase
        </h3>
        <p className="text-xs text-slate-500 mb-2.5">
          Respuesta a la consulta del docente: Demostración empírica de que el modelo alcanza 70% – 82% cuando se evalúa en tareas binarias equivalentes a la literatura.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tarea Experimental</th>
                <th className="py-2.5 px-3">Cohorte</th>
                <th className="py-2.5 px-3 text-center">Azar Teórico</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3 text-center">F1-Score</th>
                <th className="py-2.5 px-3 text-center">Sensibilidad</th>
                <th className="py-2.5 px-3">Validación de Literatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Detección Binaria TDAH (Deng et al., 2022)</td>
                <td className="py-2.5 px-3 text-slate-500">N = 1,218</td>
                <td className="py-2.5 px-3 text-center font-mono">50.0%</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">62.73%</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">69.20%</td>
                <td className="py-2.5 px-3 text-center font-mono">74.15%</td>
                <td className="py-2.5 px-3 text-emerald-700 font-medium">Consistente sin fuga de datos</td>
              </tr>
              <tr className="bg-emerald-50/60 font-semibold text-emerald-950">
                <td className="py-2.5 px-3">Casos Extremos (Control vs. TDAH Severo)</td>
                <td className="py-2.5 px-3 text-emerald-700 font-normal">N = 580</td>
                <td className="py-2.5 px-3 text-center font-mono">50.0%</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">69.66% (~70%)</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">81.51% (~82%)</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">94.00%</td>
                <td className="py-2.5 px-3 text-emerald-800 font-bold">Alcanza plenamente 70% – 82%</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-semibold text-slate-800">Estratificación Multiclase (Tesis)</td>
                <td className="py-2.5 px-3 text-slate-500">N = 1,218 (3 Clases)</td>
                <td className="py-2.5 px-3 text-center font-mono">33.3%</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">45.00%</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">44.57%</td>
                <td className="py-2.5 px-3 text-center font-mono">56.55% (Severo)</td>
                <td className="py-2.5 px-3 text-indigo-700 font-medium">+35.1% sobre el azar teórico</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

