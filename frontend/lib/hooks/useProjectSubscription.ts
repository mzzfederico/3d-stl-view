"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { trpc } from "../trpc/client";

interface ProjectSubscriptionOptions {
  onCameraUpdate?: () => void;
}

export function useProjectSubscription(
  projectId: string,
  options?: ProjectSubscriptionOptions,
) {
  const utils = trpc.useUtils();

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001",
      {
        transports: ["websocket", "polling"],
      },
    );

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      socket.emit("subscribeToProject", projectId);
    });

    socket.on(
      "projectUpdate",
      (data: { projectId: string; type: string; timestamp: Date }) => {
        console.log("Project update received:", data);

        // Call camera update callback if it's a camera update
        if (data.type === "camera" && options?.onCameraUpdate) {
          options.onCameraUpdate();
        }

        utils.projects.get.invalidate({ projectId });
      },
    );

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    // Cleanup on unmount
    return () => {
      socket.emit("unsubscribeFromProject", projectId);
      socket.disconnect();
    };
  }, [projectId, utils, options]);
}
