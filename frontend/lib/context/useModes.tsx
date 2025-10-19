import {
  createContext,
  JSX,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

export const enum ApplicationMode {
  Transform,
  Note,
}

interface ModeContextState {
  currentMode: ApplicationMode;
  setMode: (mode: ApplicationMode) => void;
}

export const ModeContext = createContext<ModeContextState>({
  currentMode: ApplicationMode.Transform,
  setMode: () => {},
});

export const ModeProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [mode, setMode] = useState<ApplicationMode>(ApplicationMode.Transform);
  return (
    <ModeContext.Provider value={{ setMode, currentMode: mode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
