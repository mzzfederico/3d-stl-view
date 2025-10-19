import { useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { useUserIdContext } from "@/lib/context/UserIdContext";
import { Project } from "@backend/schemas/project.schema";

interface CameraPosition {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export function useCameraUpdate(projectId: string) {
  const { userId } = useUserIdContext();
  const utils = trpc.useUtils();
  const updateCameraMutation = trpc.projects.updateCamera.useMutation({
    onMutate: async (newCamera) => {
      await utils.projects.get.cancel({ projectId });

      const previousProject = utils.projects.get.getData({ projectId });

      utils.projects.get.setData({ projectId }, (old: Project) => {
        if (!old) return old;
        return {
          ...old,
          camera: {
            position: newCamera.position,
            rotation: newCamera.rotation,
          },
        };
      });

      return { previousProject };
    },
    onError: (err, newCamera, context) => {
      if (context?.previousProject) {
        utils.projects.get.setData({ projectId }, context.previousProject);
      }
    },
    onSettled: () => {
      utils.projects.get.invalidate({ projectId });
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCameraRef = useRef<CameraPosition | null>(null);

  const updateCamera = useCallback(
    (
      position: { x: number; y: number; z: number },
      rotation: { x: number; y: number; z: number },
    ) => {
      latestCameraRef.current = { position, rotation };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (latestCameraRef.current) {
          updateCameraMutation.mutate({
            projectId,
            position: latestCameraRef.current.position,
            rotation: latestCameraRef.current.rotation,
            userId: userId || undefined,
          });
        }
      }, 500);
    },
    [projectId, userId, updateCameraMutation],
  );

  return { updateCamera };
}
