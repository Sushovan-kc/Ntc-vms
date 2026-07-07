const DEFAULT_API_BASE_URL = 'https://ntc-vms.onrender.com';

export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
  return configuredBaseUrl || DEFAULT_API_BASE_URL;
}

export function buildWebSocketUrl(pathname) {
  const baseUrl = new URL(getApiBaseUrl(), window.location.origin);
  const secureProtocol = baseUrl.protocol === 'https:' || window.location.protocol === 'https:';

  baseUrl.protocol = secureProtocol ? 'wss:' : 'ws:';
  baseUrl.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  baseUrl.search = '';
  baseUrl.hash = '';

  return baseUrl.toString();
}