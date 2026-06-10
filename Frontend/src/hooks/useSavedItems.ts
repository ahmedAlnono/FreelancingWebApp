import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

const SAVED_JOBS_KEY = "freelance:savedJobs";
const SHORTLIST_KEY = "freelance:shortlistedFreelancers";

function useToggleSet(storageKey: string) {
  const [ids, setIds] = useLocalStorage<string[]>(storageKey, []);

  const idSet = useMemo(() => new Set(ids), [ids]);

  const has = useCallback((id: string) => idSet.has(id), [idSet]);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setIds]
  );

  const add = useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setIds]
  );

  const remove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    [setIds]
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  return { ids, has, toggle, add, remove, clear };
}

export function useSavedJobs() {
  return useToggleSet(SAVED_JOBS_KEY);
}

export function useShortlistedFreelancers() {
  return useToggleSet(SHORTLIST_KEY);
}
