import React from 'react';
import { Users, Award, ShieldCheck, Cpu } from 'lucide-react';

export default function MetricCards() {
  const cards = [
    {
      title: 'Cohorte de Validación',
      value: '1,218',
      unit: 'Participantes HBN',
      desc: 'Validación sujeto-independiente (K=5) sin fuga de datos',
      icon: Users,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    {
      title: 'Rendimiento Binario (Literatura)',
      value: '69.7% – 81.5%',
      unit: 'Accuracy / F1',
      desc: 'Casos extremos: Control vs. Severo (Sensibilidad 94%)',
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Estratificación Multiclase (3 Clases)',
      value: '45.0%',
      unit: 'Exactitud Global',
      desc: 'Modelo B Autónomo supera a Modelo A (+2.96% ganancia)',
      icon: Cpu,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Calibración de Probabilidades',
      value: '0.2084',
      unit: 'Brier Score (Platt)',
      desc: 'Certeza clínica y reducción de sobreconfianza (Brecha C7)',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg ${c.bgColor}`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {c.value}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {c.unit}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {c.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}

