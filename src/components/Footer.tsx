import React, { useMemo } from "react";

export const Footer: React.FC = () => {
const lines = [
  "Crafted with ❤️, caffeine, and questionable coding decisions.",
  "May contain bugs… but only the friendly kind.",
  "Perfect code is a myth.",
  "When in doubt, refresh…",
  "If this breaks, let's call it a feature.",
  "Somewhere, a semicolon is crying.",
  "404: Perfect code not found.",
  "Works on my machine™.",
  "Whitespace matters more than you think.",
  "Deployed on a wing and a prayer.",
  "Version 1.0 (of many).",
];

  const randomLine = useMemo(() => {
    return lines[Math.floor(Math.random() * lines.length)];
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm mt-auto">
      <div className="container mx-auto px-3 py-3 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium  leading-[0.5rem]">
          Built by Shivraj - {randomLine}
        </p>
      </div>
    </footer>
  );
};
