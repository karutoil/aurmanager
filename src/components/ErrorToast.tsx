import { useEffect } from "react";
import { useAppStore } from "../store";

function ErrorToast() {
  const { error, clearError } = useAppStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 8000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="bg-red-900/90 border border-red-700 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <span className="text-red-400 shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-200 break-words">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorToast;
