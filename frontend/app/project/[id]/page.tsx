"use client";

import { useParams } from "next/navigation";
import ThreeScene from "./components/ThreeScene";
import Chat from "./components/Chat";
import { Suspense } from "react";
import { useProjectSubscription } from "@/lib/hooks/useProjectSubscription";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  // Subscribe to real-time project updates
  useProjectSubscription(id);

  return (
    <Suspense>
      <div className="flex h-screen w-full">
        <Chat projectId={id} />
        <ThreeScene projectId={id} />
      </div>
    </Suspense>
  );
}
