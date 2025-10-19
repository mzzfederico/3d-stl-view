import { trpc } from "@/lib/trpc/client";
import { useCallback } from "react";

export function useAnnotations(projectId: string, userId: string) {
  const utils = trpc.useUtils();

  const addAnnotationMutation = trpc.projects.addAnnotation.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId });
    },
  });

  const editAnnotationMutation = trpc.projects.editAnnotation.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId });
    },
  });

  const deleteAnnotationMutation = trpc.projects.deleteAnnotation.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId });
    },
  });

  const addAnnotation = useCallback(
    (text: string, vertex: { x: number; y: number; z: number }) => {
      addAnnotationMutation.mutate({
        projectId,
        userId,
        text,
        vertex,
      });
    },
    [projectId, userId, addAnnotationMutation]
  );

  const editAnnotation = useCallback(
    (annotationId: string, newText: string) => {
      editAnnotationMutation.mutate({
        projectId,
        annotationId,
        text: newText,
        userId,
      });
    },
    [projectId, userId, editAnnotationMutation]
  );

  const deleteAnnotation = useCallback(
    (annotationId: string) => {
      deleteAnnotationMutation.mutate({
        projectId,
        annotationId,
        userId,
      });
    },
    [projectId, userId, deleteAnnotationMutation]
  );

  const loadUserName = useCallback(
    async (userId: string): Promise<string> => {
      try {
        const user = await utils.user.get.fetch({ userId });
        return user?.name || userId;
      } catch {
        return userId;
      }
    },
    [utils]
  );

  return {
    addAnnotation,
    editAnnotation,
    deleteAnnotation,
    loadUserName,
  };
}
