"use client";

import { useParams } from "next/navigation";
import ThreeScene from "./components/ThreeScene";
import Chat from "./components/Chat";
import { Suspense } from "react";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Suspense>
      <div className="flex h-screen w-full">
        <Chat projectId={id} />
        <ThreeScene projectId={id} />
      </div>
    </Suspense>
  );
}
