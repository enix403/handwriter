import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Use it like this:
 *
 * <Route path='/some/path' Component={redirectRouteTo('/some/another/path')} />
 */
export function redirectRouteTo(location: string) {
  return () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate(location);
    }, []);
    return null;
  };
}
