import { useEffect, useMemo, useState } from "react";
import {
  SOCKET_URL,
  USER_ID_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
} from "../constants";
import { io, Socket } from "socket.io-client";

interface useUserSocketOptions {
  userId?: string;
  userName?: string;
  setUserName: (name: string) => void;
  setUserId: (id: string) => void;
}

export function useUserSocket({
  userId,
  setUserName,
  setUserId,
}: useUserSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const updateName = useMemo(
    () => (name: string) => {
      setUserName(name);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_NAME_STORAGE_KEY, name);
      }

      // Send the name to the backend
      if (socket && userId) {
        socket.emit("setUserName", { userId, userName: name });
      }
    },
    [socket, userId, setUserName],
  );

  useEffect(() => {
    const newSocket: Socket = io(SOCKET_URL, {
      auth: {
        userId: userId || undefined, // Send existing userId if we have one
      },
    });

    setSocket(newSocket);

    // Listen for userId assignment from server
    newSocket.on("userId", (newUserId: string) => {
      setUserId(newUserId);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_ID_STORAGE_KEY, newUserId);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [setUserId, userId]);

  return { updateName };
}
