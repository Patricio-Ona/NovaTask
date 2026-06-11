import { handleDemoRequest } from "./demo-server";

const resolveApiUrl = () => {
  const configured = import.meta.env.VITE_API_URL;

  if (configured) {
    try {
      const url = new URL(configured);
      const currentHost = window.location.hostname;
      const localHosts = new Set(["localhost", "127.0.0.1"]);

      if (localHosts.has(url.hostname) && !localHosts.has(currentHost)) {
        url.hostname = currentHost;
        return url.toString().replace(/\/$/, "");
      }

      return url.toString().replace(/\/$/, "");
    } catch {
      return configured.replace(/\/$/, "");
    }
  }

  return `${window.location.protocol}//${window.location.hostname}:4000/api`;
};

const API_URL = resolveApiUrl();
let demoMode = import.meta.env.VITE_DEMO_MODE === "true";

let getSession = () => null;
let setSession = () => {};
let clearSession = () => {};

export const configureApiClient = (config) => {
  getSession = config.getSession;
  setSession = config.setSession;
  clearSession = config.clearSession;
};

export const isUsingDemoBackend = () => demoMode;

const createNetworkError = () => {
  const error = new Error(
    "No se pudo conectar con el servidor. Verifica que el backend y PostgreSQL esten activos."
  );
  error.status = 0;
  error.details = null;
  return error;
};

const performDemoRequest = (path, options = {}) =>
  handleDemoRequest(path, options, {
    session: getSession(),
  });

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "No se pudo completar la solicitud.");
    error.status = response.status;
    error.details = payload.details ?? null;
    throw error;
  }

  return payload.data ?? payload;
};

const rawRequest = async (path, options = {}) => {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw createNetworkError();
  }
};

const tryRefresh = async () => {
  const session = getSession();
  if (!session?.refreshToken) {
    return null;
  }

  if (demoMode) {
    const payload = await performDemoRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    }).catch(() => null);

    if (!payload?.accessToken) {
      clearSession();
      return null;
    }

    const nextSession = {
      ...session,
      accessToken: payload.accessToken,
      user: payload.user ?? session.user,
      mode: payload.mode ?? session.mode,
    };
    setSession(nextSession);
    return nextSession;
  }

  const response = await rawRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const payload = await parseResponse(response);
  const nextSession = {
    ...session,
    accessToken: payload.accessToken,
    user: payload.user ?? session.user,
    mode: payload.mode ?? session.mode,
  };
  setSession(nextSession);
  return nextSession;
};

export const publicRequest = async (path, options = {}) => {
  if (demoMode) {
    return performDemoRequest(path, options);
  }

  const response = await rawRequest(path, options);
  return parseResponse(response);
};

export const apiRequest = async (path, options = {}) => {
  const session = getSession();
  const requestOptions = {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
  };

  if (demoMode) {
    return performDemoRequest(path, requestOptions);
  }

  const response = await rawRequest(path, requestOptions);

  if (response.status === 401 && !options._skipRefresh) {
    const refreshed = await tryRefresh();

    if (refreshed?.accessToken) {
      const retryResponse = await rawRequest(path, {
        ...options,
        _skipRefresh: true,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      });

      return parseResponse(retryResponse);
    }
  }

  return parseResponse(response);
};

export const apiGet = (path) => apiRequest(path, { method: "GET" });
export const apiPost = (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) });
export const apiPatch = (path, body) => apiRequest(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path) => apiRequest(path, { method: "DELETE" });
