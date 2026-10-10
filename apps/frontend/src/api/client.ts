const API_BASE_URL = 'http://localhost:3000';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export class ApiError extends Error {
  statusCode: number;
  error: string;
  messages: string[];

  constructor(statusCode: number, error: string, messages: string[]) {
    super(messages.join(', '));
    this.statusCode = statusCode;
    this.error = error;
    this.messages = messages;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = localStorage.getItem('devtrack_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem('devtrack_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const messages = Array.isArray(data.message)
      ? data.message
      : [data.message || 'An error occurred'];

    throw new ApiError(
      response.status,
      data.error || 'Request Failed',
      messages,
    );
  }

  return data as T;
}
