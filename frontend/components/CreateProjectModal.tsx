"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BaseModalProps } from "@/lib/types/modal";

export interface CreateProjectModalProps extends BaseModalProps {
  onSuccess: (projectId: string) => void;
}

export default function CreateProjectModal({
  open,
  setOpen: onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("");

  const utils = trpc.useUtils();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      setProjectTitle("");
      // Invalidate projects list to refresh the table
      utils.projects.list.invalidate();
      // Notify parent and navigate
      onSuccess(data.projectId);
      router.push(`/project/${data.projectId}`);
    },
  });

  const handleCreate = () => {
    if (!projectTitle.trim()) return;
    createProject.mutate({ title: projectTitle });
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setProjectTitle("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Project title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!projectTitle.trim() || createProject.isPending}
          >
            {createProject.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
