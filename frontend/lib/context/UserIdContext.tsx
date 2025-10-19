"use client";

import {
  createContext,
  JSX,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL, USER_ID_STORAGE_KEY, USER_NAME_STORAGE_KEY } from "../constants";
import UserNameModal from "@/components/UserNameModal";

interface UserIdContextState {
  userId: string | null;
  userName: string | null;
}

export const UserIdContext = createContext<UserIdContextState>({
  userId: null,
  userName: null,
});

export const UserIdProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [userId, setUserId] = useState<string | null>(() => {
    // Try to get existing userId from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_ID_STORAGE_KEY);
    }
    return null;
  });

  const [userName, setUserName] = useState<string | null>(() => {
    // Try to get existing userName from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_NAME_STORAGE_KEY);
    }
    return null;
  });

  const [showNameModal, setShowNameModal] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to UserGateway
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

      // Show modal if no userName exists
      if (!userName) {
        setShowNameModal(true);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []); // Only run once on mount

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_NAME_STORAGE_KEY, name);
    }

    // Send the name to the backend
    if (socket && userId) {
      socket.emit("setUserName", { userId, userName: name });
    }

    setShowNameModal(false);
  };

  return (
    <UserIdContext.Provider value={{ userId, userName }}>
      <UserNameModal open={showNameModal} onSubmit={handleNameSubmit} />
      {children}
    </UserIdContext.Provider>
  );
};

export const useUserIdContext = () => useContext(UserIdContext);
