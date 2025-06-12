
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false); // Default to a consistent initial value
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true); // Signal that client has mounted

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches); // Use mql.matches for reliability and to listen to changes
    };

    setIsMobile(mql.matches); // Set initial client-side value correctly
    mql.addEventListener("change", onChange); // Listen for changes

    return () => {
      mql.removeEventListener("change", onChange); // Clean up listener
    }
  }, []);

  // On the server, and on the client before useEffect runs (hasMounted is false),
  // return the default value (false). This ensures server and initial client render match.
  // After useEffect runs on the client (hasMounted is true), return the actual client-side value.
  if (!hasMounted) {
    return false;
  }

  return isMobile;
}
