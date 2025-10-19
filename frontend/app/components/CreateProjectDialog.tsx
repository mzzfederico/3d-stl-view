"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useModal, ModalId } from "@/lib/context/ModalContext";

export function CreateProjectDialog() {
  const { openModal } = useModal();

  const handleOpenCreateModal = () => {
    openModal(ModalId.CreateProject, {
      onSuccess: (projectId) => {
        // Navigation is handled in the modal component
        console.log("Project created:", projectId);
      },
    });
  };

  return (
    <Button onClick={handleOpenCreateModal}>
      <Plus className="mr-2 h-4 w-4" />
      Create Project
    </Button>
  );
}
