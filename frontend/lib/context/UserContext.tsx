"use client";

import {
  createContext,
  JSX,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  SOCKET_URL,
  USER_ID_STORAGE_KEY,
  USER_NAME_STORAGE_KEY,
} from "../constants";
import { useUserSocket } from "../hooks/useUserSocket";

interface UserContextState {
  userId?: string;
  userName?: string;
  updateName: (name: string) => void;
}

export const UserContext = createContext<UserContextState>({
  updateName: () => {},
});

export const UserIdProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const [userId, setUserId] = useState<string | undefined>(() => {
    return localStorage.getItem(USER_ID_STORAGE_KEY) ?? undefined;
  });

  const [userName, setUserName] = useState<string | undefined>(() => {
    return localStorage.getItem(USER_NAME_STORAGE_KEY) ?? undefined;
  });

  const { updateName } = useUserSocket({
    userId,
    userName,
    setUserId,
    setUserName,
  });

  const value = useMemo(
    () => ({
      userId,
      userName,
      updateName,
    }),
    [userId, userName, updateName],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return ctx;
};
