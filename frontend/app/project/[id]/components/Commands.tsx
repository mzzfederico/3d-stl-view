import { Button } from "@/components/ui/button";
import { MODES, useMode } from "@/lib/context/useModes";
import { PropsWithChildren } from "react";

interface CommandButtonProps extends PropsWithChildren {
  mode: MODES;
}

const CommandButton = ({ mode, children }: CommandButtonProps) => {
  const { setMode, currentMode } = useMode();

  const isActive = currentMode === mode;

  return (
    <Button
      className={`btn border ${
        isActive
          ? "bg-blue-500 text-white border-blue-500"
          : "hover:bg-blue-300"
      }`}
      onClick={() => setMode(mode)}
    >
      {children}
    </Button>
  );
};

export default function Commands() {
  return (
    <aside className="fixed right-10 top-10 z-40 bg-white rounded-lg shadow-md p-2">
      <ul className="list-none flex flex-col gap-2">
        <CommandButton mode={MODES.Transform}>Transform</CommandButton>
        <CommandButton mode={MODES.Note}>Note</CommandButton>
      </ul>
    </aside>
  );
}
