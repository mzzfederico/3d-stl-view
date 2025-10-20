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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      setProjectTitle("");
      // Invalidate projects list to refresh the table
      utils.projects.list.invalidate();
      // Show success toast
      toast({
        title: "Project created!",
        description: `"${projectTitle}" has been successfully created.`,
      });
      // Notify parent and navigate
      onSuccess(data.projectId);
      router.push(`/project/${data.projectId}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: error.message || "Could not create project. Please try again.",
        variant: "destructive",
      });
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
