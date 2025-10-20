import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL, USER_ID_STORAGE_KEY } from "../constants";

/**
 * Hook to get or create a persistent user ID from the UserGateway
 * @returns userId - The unique user identifier, or null if not yet assigned
 */
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_ID_STORAGE_KEY);
    }
    return null;
  });

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      auth: {
        userId: userId || undefined,
      },
    });

    // Listen for userId assignment from server
    socket.on("userId", (newUserId: string) => {
      setUserId(newUserId);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_ID_STORAGE_KEY, newUserId);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return userId;
}
