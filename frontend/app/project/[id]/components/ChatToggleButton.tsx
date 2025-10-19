import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

interface ChatToggleButtonProps {
  onClick: () => void;
}

export default function ChatToggleButton({ onClick }: ChatToggleButtonProps) {
  return (
    <div className="absolute left-6 top-6 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <Button
        variant="outline"
        className="shadow-md flex items-center gap-2 transition-all duration-200 hover:shadow-xl hover:border-blue-400 active:shadow-sm w-10 h-10 p-0"
        onClick={onClick}
        aria-label="Open chat"
        title="Open chat"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
