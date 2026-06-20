export default function AdminAlert({ message, type = 'error', onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`mb-4 px-4 py-3 border rounded text-sm flex items-start justify-between gap-3 ${styles[type] || styles.error}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  );
}
