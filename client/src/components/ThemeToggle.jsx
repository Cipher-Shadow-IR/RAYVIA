import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      aria-label={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      className={`h-9 w-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#94A3B8] hover:text-white transition-all cursor-pointer shrink-0 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FBBF24] transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#1E40AF] transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
