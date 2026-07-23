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

export function buildCentrifugoWebSocketUrl(pathname = '/connection/websocket') {
  const configuredUrl = import.meta.env.VITE_CENTRIFUGO_WS_URL?.trim() || import.meta.env.VITE_CENTRIFUGO_URL?.trim();
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (configuredUrl) {
    const baseUrl = new URL(configuredUrl, window.location.origin);

    if (baseUrl.protocol === 'http:') {
      baseUrl.protocol = 'ws:';
    } else if (baseUrl.protocol === 'https:') {
      baseUrl.protocol = 'wss:';
    }

    if (!baseUrl.pathname || baseUrl.pathname === '/') {
      baseUrl.pathname = normalizedPathname;
    }

    baseUrl.search = '';
    baseUrl.hash = '';
    return baseUrl.toString();
  }

  return new URL(`ws://localhost:8010${normalizedPathname}`).toString();
}