/**
 * Toast notification component for the Admin panel.
 * Renders fixed-position toasts (bottom-right) that auto-dismiss.
 */
import React, { useEffect } from "react";

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const iconMap = {
    success: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    warning: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M9.13 3.5l-6.56 11.35A1 1 0 003.44 16.5h13.12a1 1 0 00.87-1.5L10.87 3.5a1 1 0 00-1.74 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M10 8.5v3M10 13.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="assertive">
      <span className="toast-icon">{iconMap[toast.type]}</span>
      <span className="toast-text">{toast.text}</span>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

function Toast({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

export default Toast;
