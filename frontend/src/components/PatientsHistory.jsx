import React, { useState, useEffect } from 'react';
import { Database, FileText, Download, RefreshCw, UserCheck } from 'lucide-react';
import { fetchScreeningsHistory } from '../services/api';

export default function PatientsHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchScreeningsHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Database className="w-5 h-5 text-sky-600 mr-2" />
            Historial de Tamizajes y Evaluaciones Clínicas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro persistente en base de datos SQLite para seguimiento longitudinal
          </p>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Cargando registros históricos...
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No hay evaluaciones registradas en el historial. Ejecute un tamizaje para comenzar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Fecha / Hora</th>
                <th className="py-3 px-3">ID Paciente</th>
                <th className="py-3 px-3">Edad / Sexo</th>
                <th className="py-3 px-3">Modelo</th>
                <th className="py-3 px-3">Estrato Predicho</th>
                <th className="py-3 px-3 text-right">P(Severo)</th>
                <th className="py-3 px-3 text-right">Certeza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => {
                const isSevere = item.stratum_name.includes('Severo');
                const isModerate = item.stratum_name.includes('Moderado');
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (isSevere) badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                if (isModerate) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{item.id}</td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.patient_id}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.age} a • {item.sex}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-[140px] truncate" title={item.model_used}>
                      {item.model_used}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-semibold border ${badgeClass}`}>
                        {item.stratum_name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {item.probability_severo.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {item.confidence_score.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

