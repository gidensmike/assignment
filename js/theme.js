/* ==========================================================================
   THEME — Light / Dark mode with localStorage persistence
   Inlined on every page so the correct theme applies before first paint.
   ========================================================================== */
(() => {
  const STORAGE_KEY = "assignment-showcase-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function getInitialTheme() {
    return getStoredTheme() || "light";
  }

  // Apply before first paint (called synchronously by the inline script)
  window.applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  };

  // Toggle used by the button; returns the new theme
  window.toggleTheme = () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    window.applyTheme(next);
    return next;
  };

  // Initialize immediately on script load
  window.applyTheme(getInitialTheme());
})();
