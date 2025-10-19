"use client";

import { ModeProvider } from "@/lib/context/useModes";
import { useUserIdContext } from "@/lib/context/UserIdContext";
import { useProjectSubscription } from "@/lib/hooks/useProjectSubscription";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import Chat from "./components/Chat";
import Commands from "./components/Commands";
import ThreeScene from "./components/ThreeScene";
import ChatToggleButton from "./components/ChatToggleButton";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { userId } = useUserIdContext();
  const [isChatOpen, setIsChatOpen] = useState(true);

  useProjectSubscription(id, { userId });

  return (
    <ModeProvider>
      <Suspense>
        <div className="relative h-screen w-full overflow-hidden">
          <ThreeScene projectId={id} />

          {isChatOpen && (
            <Chat projectId={id} onClose={() => setIsChatOpen(false)} />
          )}
          {!isChatOpen && (
            <ChatToggleButton onClick={() => setIsChatOpen(true)} />
          )}
          <Commands />
        </div>
      </Suspense>
    </ModeProvider>
  );
}
