"use client";

import { ModeProvider } from "@/lib/context/useModes";
import { useProjectSubscription } from "@/lib/hooks/useProjectSubscription";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import Chat from "./components/Chat";
import Commands from "./components/Commands";
import ThreeScene from "./components/ThreeScene";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  // Subscribe to real-time project updates
  useProjectSubscription(id);

  return (
    <ModeProvider>
      <Suspense>
        <div className="flex h-screen w-full">
          <Chat projectId={id} />
          <ThreeScene projectId={id} />
        </div>
        <Commands />
      </Suspense>
    </ModeProvider>
  );
}
