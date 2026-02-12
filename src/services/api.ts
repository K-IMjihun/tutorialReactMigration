const API_BASE_URL = '/api';

interface ApiOptions {
  method?: string;
  data?: unknown;
  contentType?: 'json' | 'formdata';
}

async function apiCall<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', data, contentType } = options;

  const config: RequestInit = {
    method,
    headers: {},
  };

  if (data instanceof FormData) {
    config.body = data;
  } else if (contentType === 'json' || (data && method !== 'GET')) {
    (config.headers as Record<string, string>)['Content-Type'] = 'application/json; charset=UTF-8';
    config.body = JSON.stringify(data);
  }

  if (method === 'GET' && data) {
    const params = new URLSearchParams(data as Record<string, string>);
    url = `${url}?${params.toString()}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, params?: Record<string, string | number>) =>
    apiCall<T>(url, { method: 'GET', data: params as unknown }),

  post: <T>(url: string, data?: unknown, contentType?: 'json' | 'formdata') =>
    apiCall<T>(url, { method: 'POST', data, contentType: contentType ?? 'json' }),

  put: <T>(url: string, data?: unknown) =>
    apiCall<T>(url, { method: 'PUT', data, contentType: 'json' }),

  delete: <T>(url: string) =>
    apiCall<T>(url, { method: 'DELETE' }),
};
