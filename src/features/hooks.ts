import { useEffect, useRef } from "react";

export function useObject<T>(creator: () => T) {
  let ref = useRef<T | null>(null);
  if (ref.current == undefined) {
    ref.current = creator();
  }
  return ref.current;
}


export function useFirstRender() {
  const firstRender = useRef(true);

  useEffect(() => {
    if (!firstRender.current) return;
    firstRender.current = false;
  }, []);

  return firstRender.current;
}
