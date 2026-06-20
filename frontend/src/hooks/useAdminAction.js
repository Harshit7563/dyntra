import { useState, useCallback } from 'react';

export function useAdminAction() {
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [busy, setBusy] = useState(false);

  const clearAlert = () => setAlert({ type: '', message: '' });

  const run = useCallback(async (action, successMessage) => {
    setBusy(true);
    clearAlert();
    try {
      const result = await action();
      if (successMessage) setAlert({ type: 'success', message: successMessage });
      return result;
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Something went wrong' });
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  return { alert, busy, run, clearAlert, setAlert };
}
