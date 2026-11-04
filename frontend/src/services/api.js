/**
 * api.js
 * Cliente de comunicación con el backend FastAPI de la Plataforma TDAH.
 */

const API_BASE = '/api/v1';

export async function fetchSystemInfo() {
  const res = await fetch(`${API_BASE}/system-info`);
  if (!res.ok) throw new Error('Error al obtener información del sistema');
  return res.json();
}

export async function fetchDemoPatients() {
  const res = await fetch(`${API_BASE}/demo-patients`);
  if (!res.ok) throw new Error('Error al cargar catálogo de pacientes demo');
  return res.json();
}

export async function fetchDemoPatientDetail(patientKey) {
  const res = await fetch(`${API_BASE}/demo-patients/${patientKey}`);
  if (!res.ok) throw new Error(`Error al cargar datos del paciente ${patientKey}`);
  return res.json();
}

export async function predictStratification(payload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error en la inferencia' }));
    throw new Error(err.detail || 'Fallo en la predicción');
  }
  return res.json();
}

export async function fetchScreeningsHistory() {
  const res = await fetch(`${API_BASE}/screenings`);
  if (!res.ok) throw new Error('Error al obtener historial de evaluaciones');
  return res.json();
}

export async function generateClinicalReport(payload) {
  const res = await fetch(`${API_BASE}/generate-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al generar informe PDF');
  return res.json();
}

