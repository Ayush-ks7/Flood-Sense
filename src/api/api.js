// Set VITE_API_BASE_URL in .env.local when the API is hosted elsewhere.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}

export async function getStatus() {
  return request("/status");
}

export async function getDashboard() {
  return request("/dashboard/live");
}

export async function getForecast() {
  return request("/forecast");
}

export async function getIncidents() {
  return request("/incidents");
}

export async function getFloodPolygons() {
  return request("/spatial-risk/polygons");
}

export async function getRiskHeatmap() {
  return request("/spatial-risk/heatmap");
}

export async function getRiverNetwork() {
  return request("/spatial-risk/river-network");
}

export async function getImpactSummary() {
  return request("/spatial-risk/impact-summary");
}
