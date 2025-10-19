import {
  createContext,
  JSX,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

export const enum MODES {
  Transform,
  Note,
}

interface ModeContextState {
  currentMode: MODES;
  setMode: (mode: MODES) => void;
}

export const ModeContext = createContext<ModeContextState>({
  currentMode: MODES.Transform,
  setMode: () => {},
});

export const ModeProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [mode, setMode] = useState<MODES>(MODES.Transform);
  return (
    <ModeContext.Provider value={{ setMode, currentMode: mode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
