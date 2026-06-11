import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);
const createToastId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = ({ title, description, tone = "info" }) => {
    const id = createToastId();
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
