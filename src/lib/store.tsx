import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { KEY, fresh, parseProgress, type Progress } from "./engine";
const Context = createContext<{
  p: Progress;
  set: React.Dispatch<React.SetStateAction<Progress>>;
  saveError: boolean;
  recovery: string | null;
  resumeSaving: () => void;
} | null>(null);
function initial() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { p: fresh(), recovery: null };
    try {
      return { p: parseProgress(raw), recovery: null };
    } catch {
      return { p: fresh(), recovery: raw };
    }
  } catch {
    return { p: fresh(), recovery: null };
  }
}
export function Provider({ children }: { children: ReactNode }) {
  const [start] = useState(initial);
  const [p, set] = useState(start.p);
  const [recovery, setRecovery] = useState(start.recovery);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    if (recovery !== null) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [p, recovery]);
  return (
    <Context.Provider
      value={{
        p,
        set,
        saveError,
        recovery,
        resumeSaving: () => setRecovery(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  return useContext(Context)!;
}
