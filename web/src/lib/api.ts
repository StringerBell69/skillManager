export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  getToken?: () => Promise<string | null>;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { getToken, headers, ...rest } = options;
  
  const reqHeaders = new Headers(headers);
  reqHeaders.set("Content-Type", "application/json");

  if (getToken) {
    const token = await getToken();
    if (token) {
      reqHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: reqHeaders,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.code || "UNKNOWN_ERROR",
      data?.message || "An unexpected error occurred"
    );
  }

  return data as T;
}
