import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatMessage } from "../hooks/useChatMessage";
import { useProjectData } from "@/lib/hooks/useProjectData";
import { useUserContext } from "@/lib/context/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

interface ChatProps {
  onClose?: () => void;
}

export default function Chat({ onClose }: ChatProps) {
  const router = useRouter();
  const { id: projectId } = useParams<{ id: string }>();

  const { project, query } = useProjectData(projectId);
  const { userId } = useUserContext();
  const { sendMessage } = useChatMessage(projectId);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && projectId && userId) {
      sendMessage(userId, message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleBackToProjects = () => {
    router.push("/");
  };

  return (
    <div className="absolute left-6 top-6 bottom-6 z-30 w-96">
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Button
            variant="outline"
            className="justify-start"
            onClick={handleBackToProjects}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {project.chatLog.length === 0 && (
            <p className="text-sm text-gray-500">No messages yet...</p>
          )}
          {project.chatLog.map(({ userId, userName, timestamp, message }) => (
            <div key={new Date(timestamp).getTime()} className="mb-2">
              <p className="text-sm text-gray-500">{userName || userId}</p>
              <p className="text-sm text-gray-700">{message}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}
