import { Button } from "@/components/ui/button";
import { MODES, useMode } from "@/lib/context/useModes";
import { Move3d, StickyNote } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface CommandButtonProps {
  mode: MODES;
  icon: LucideIcon;
  label: string;
}

const CommandButton = ({ mode, icon: Icon, label }: CommandButtonProps) => {
  const { setMode, currentMode } = useMode();

  const isActive = currentMode === mode;

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      className={`w-10 h-10 p-0 transition-all duration-200 ${
        isActive
          ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
          : "shadow-sm hover:shadow-lg hover:border-blue-400 active:shadow-sm"
      }`}
      onClick={() => setMode(mode)}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
};

export default function Commands() {
  return (
    <aside className="fixed right-6 top-6 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex flex-col gap-2">
        <CommandButton mode={MODES.Transform} icon={Move3d} label="Transform" />
        <CommandButton mode={MODES.Note} icon={StickyNote} label="Note" />
      </div>
    </aside>
  );
}
