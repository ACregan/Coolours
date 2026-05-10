import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
} from "react";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}
export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [haveValueFromLocalStorage, setHaveValueFromLocalStorage] =
    useState<boolean>(false);

  // INITIAL SYNC With data from LocalStorage
  useLayoutEffect(() => {
    const isDarkModeInBrowser = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDarkModeInLocalStorage = window.localStorage.getItem("dark-mode");
    setHaveValueFromLocalStorage(true);
    setDarkMode(
      isDarkModeInLocalStorage === "true" ? true : isDarkModeInBrowser,
    );
  }, []);

  // UPDATE VALUE in LocalStorage
  useEffect(() => {
    window.localStorage.setItem("dark-mode", darkMode ? "true" : "false");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {haveValueFromLocalStorage && children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
