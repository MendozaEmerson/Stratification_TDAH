import React from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ShapWaterfall({ shapFeatures = [] }) {
  if (!shapFeatures || shapFeatures.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm text-center text-slate-500 text-sm">
        No hay datos de explicabilidad SHAP disponibles.
      </div>
    );
  }

  // Encontrar el valor máximo absoluto para la escala de las barras
  const maxAbs = Math.max(...shapFeatures.map((f) => Math.abs(f.impact_class2)), 0.05);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Explicabilidad Clínica (Atribución Local SHAP)
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              TreeExplainer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biomarcadores más influyentes en el riesgo predicho para este paciente
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {shapFeatures.map((feat, idx) => {
          const impact = feat.impact_class2;
          const isRisk = impact > 0;
          const widthPct = Math.min(100, Math.max(8, (Math.abs(impact) / maxAbs) * 100));

          return (
            <div key={idx} className="group">
              <div className="flex items-baseline justify-between text-xs mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-800">
                    {feat.display_name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (Valor: {feat.value})
                  </span>
                </div>
                <div className="flex items-center space-x-1 font-mono text-[11px]">
                  {isRisk ? (
                    <span className="text-rose-600 font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      +{impact.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      {impact.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de impacto SHAP */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isRisk
                      ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-0.5">
                <span>{feat.feature_name}</span>
                <span className={isRisk ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                  {feat.direction}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center">
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Rojo = Aumenta probabilidad de TDAH Severo | Verde = Factor protector / Control
        </span>
        <span className="font-mono">Teoría de Juegos Cooperativos</span>
      </div>
    </div>
  );
}

