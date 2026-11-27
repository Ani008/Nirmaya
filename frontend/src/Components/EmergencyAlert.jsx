// Full-screen red alert. Covers everything, no follow-up questions.
export default function EmergencyAlert({ message, backLabel, onBack }) {
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-700 px-6 text-center text-white"
    >
      <svg viewBox="0 0 24 24" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      <p className="mt-6 text-4xl font-extrabold leading-tight">{message}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-12 h-14 w-full max-w-xs rounded-full bg-white text-xl font-bold text-red-700 transition active:scale-95"
      >
        {backLabel}
      </button>
    </div>
  );
}
