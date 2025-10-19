"use client";

import { useEffect } from "react";
import { useUserContext } from "@/lib/context/UserContext";
import { useModal } from "@/lib/context/ModalContext";
import { ModalId } from "@/lib/context/ModalContext";

/**
 * Utility component that checks if the user has a name set.
 * If not, it automatically triggers the UserName modal.
 */
export default function UserNameCheck() {
  const { userId, userName, updateName } = useUserContext();
  const { openModal, isOpen } = useModal();

  useEffect(() => {
    // Only check if userId is available and userName is missing
    if (userId && !userName && !isOpen(ModalId.UserName)) {
      openModal(ModalId.UserName, {
        mode: "create",
        onSubmit: updateName,
        canDismiss: false,
      });
    }
  }, [userId, userName, openModal, isOpen, updateName]);

  // This component doesn't render anything
  return null;
}
