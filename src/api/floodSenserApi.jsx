const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export function getDashboardLive() {
  return fetchAPI("/dashboard/live");
}

export function getStatus() {
  return fetchAPI("/status");
}

export function getIncidents() {
  return fetchAPI("/incidents");
}

export function getForecast() {
  return fetchAPI("/forecast");
}