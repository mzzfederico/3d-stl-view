import { useChatMessage } from "@/lib/hooks/useChatMessage";
import { useProjectData } from "@/lib/hooks/useProjectData";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Project } from "@backend/schemas/project.schema";

interface ChatProps {
  projectId: Project["id"];
}

export default function Chat({ projectId }: ChatProps) {
  const { project, query } = useProjectData(projectId);
  const { sendMessage } = useChatMessage(projectId);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && projectId) {
      sendMessage("temp-user-id", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Project Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {project.chatLog.length === 0 && (
          <p className="text-sm text-gray-500">No messages yet...</p>
        )}
        {project.chatLog.map(({ userId, timestamp, message }) => (
          <div key={new Date(timestamp).getTime()} className="mb-2">
            <p className="text-sm text-gray-500">{userId}</p>
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
  );
}
