import React from 'react';

/**
 * LoadingButton Component
 * Reusable touch-friendly action button with built-in loading spinner state.
 */
export default function LoadingButton({
  children,
  loading = false,
  loadingText = 'Saving...',
  type = 'button',
  className = 'btn btn-primary',
  disabled = false,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-loading-content">
          <span className="btn-spinner" aria-hidden="true" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
