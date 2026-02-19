const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const USER_ID = import.meta.env.VITE_USER_ID ?? 'user_1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json().catch(() => ({ ok: false, error: { code: 'PARSE_ERROR', message: res.statusText } }));

  if (!res.ok || json.ok === false) {
    const error = json.error ?? { code: 'API_ERROR', message: '요청에 실패했습니다' };
    throw new ApiError(res.status, error.code, error.message, error.details);
  }

  // { ok: true, data: T } 형식
  return json.data ?? json;
}
