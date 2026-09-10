import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++toastId;
      const next = { id, type: toast.type || "info", message: toast.message };
      setToasts((prev) => [...prev.slice(-3), next]);
      const timer = setTimeout(() => dismiss(id), toast.duration ?? 4600);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  const success = useCallback((message) => push({ type: "success", message }), [push]);
  const error = useCallback((message) => push({ type: "error", message }), [push]);
  const info = useCallback((message) => push({ type: "info", message }), [push]);

  const value = useMemo(
    () => ({ toasts, push, success, error, info, dismiss }),
    [toasts, push, success, error, info, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within <ToastProvider>");
  return ctx;
}