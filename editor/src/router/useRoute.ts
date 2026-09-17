import { useSyncExternalStore } from "react";
import { parsePath, type Route } from "./routes";

// Client-side routing without a router dependency: the History API plus one
// event so pushState — which browsers do not announce — still re-renders.
const NAVIGATION_EVENT = "editor:navigate";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAVIGATION_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAVIGATION_EVENT, onChange);
  };
};

const currentPath = () => window.location.pathname;

export const navigate = (path: string, { replace = false } = {}) => {
  if (path === currentPath()) return;
  if (replace) window.history.replaceState(null, "", path);
  else window.history.pushState(null, "", path);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
};

/** The route the browser is on, re-read on every navigation. */
export const useRoute = (): Route =>
  parsePath(useSyncExternalStore(subscribe, currentPath, currentPath));
