import { useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Oops! Something went wrong</h1>
        <p className="error-message">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
      <style>{`
        .error-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f6f6f7;
          z-index: 9999;
        }
        .error-content {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-width: 90%;
          width: 400px;
        }
        h1 {
          color: #202223;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .error-message {
          color: #637381;
          margin-bottom: 1.5rem;
        }
        .retry-button {
          background: #5c6ac4;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .retry-button:hover {
          background: #4959bd;
        }
      `}</style>
    </div>
  );
} 