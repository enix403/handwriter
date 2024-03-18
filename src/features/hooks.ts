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

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
