"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (window.localStorage.getItem("auction-arena-theme") as Theme | null) || (window.localStorage.getItem("bidarena-theme") as Theme | null) || "dark";
    applyTheme(saved);
    setTheme(saved);
  }, []);

  function applyTheme(next: Theme) {
    document.documentElement.classList.toggle("theme-light", next === "light");
    document.documentElement.classList.toggle("theme-dark", next === "dark");
    window.localStorage.setItem("auction-arena-theme", next);
  }

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button onClick={toggle} className="theme-toggle" aria-label="Toggle light and dark theme">
      <span className={theme === "dark" ? "active" : ""}>Dark</span>
      <span className={theme === "light" ? "active" : ""}>Light</span>
    </button>
  );
}
