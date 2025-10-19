"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { trpc } from "../trpc/client";
import { SOCKET_URL } from "../constants";

interface ProjectSubscriptionOptions {
  userId?: string | null;
}

export function useProjectSubscription(
  projectId: string,
  options?: ProjectSubscriptionOptions,
) {
  const utils = trpc.useUtils();

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      socket.emit("subscribeToProject", {
        projectId,
        userId: options?.userId || undefined,
      });
    });

    socket.on(
      "projectUpdate",
      (data: { projectId: string; type: string; timestamp: Date }) => {
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
  }, [projectId, utils, options?.userId]);
}
