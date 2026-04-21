import { useCallback, useState } from "react";

export const FIRST_LAUNCH_STORAGE_KEY = "ehon-gacha-first-launched";

export type UseFirstLaunchReturn = {
  isFirstLaunch: boolean;
  markLaunched: () => void;
};

export const useFirstLaunch = (): UseFirstLaunchReturn => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(
    () => localStorage.getItem(FIRST_LAUNCH_STORAGE_KEY) !== "true",
  );

  const markLaunched = useCallback(() => {
    localStorage.setItem(FIRST_LAUNCH_STORAGE_KEY, "true");
    setIsFirstLaunch(false);
  }, []);

  return { isFirstLaunch, markLaunched };
};
