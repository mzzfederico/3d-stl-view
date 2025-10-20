"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Share } from "lucide-react";
import { useUserContext } from "@/lib/context/UserContext";
import { useParams } from "next/navigation";
import { useProjectData } from "@/lib/hooks/useProjectData";
import { useToast } from "@/hooks/use-toast";

export default function ProjectTitle() {
  const { id } = useParams<{ id: string }>();
  const { project } = useProjectData(id);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const { userId } = useUserContext();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const updateTitleMutation = trpc.projects.updateTitle.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId: id });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    if (title.trim()) {
      updateTitleMutation.mutate({
        projectId: id,
        title: title.trim(),
        userId: userId || undefined,
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Project link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setTitle(project.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 bg-transparent border-gray-600 text-white placeholder:text-gray-400"
          autoFocus
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:bg-gray-700 text-white"
          onClick={handleSave}
          disabled={updateTitleMutation.isPending}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:bg-gray-700 text-white"
          onClick={handleCancel}
          disabled={updateTitleMutation.isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 group">
      <div className="flex items-center gap-4 bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-full">
        <span className="text-white font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 transition-opacity hover:bg-gray-700"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3 text-white" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 transition-opacity hover:bg-gray-700"
            onClick={handleShare}
          >
            <Share className="h-3 w-3 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
