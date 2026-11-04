import React from 'react';
import { Activity, Database, Layers, FileText, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Plataforma<span className="text-sky-600">TDAH</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  UNSA 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Estratificación Predictiva con CNN 1D y XGBoost • Biomarcadores Oculares
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('screening')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'screening'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Tamizaje Clínico</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>Historial</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Arquitectura & Métricas</span>
              <span className="md:hidden">Métricas</span>
            </button>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Ver Documentación Interactiva Swagger / OpenAPI"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className="hidden lg:inline">Swagger API</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

