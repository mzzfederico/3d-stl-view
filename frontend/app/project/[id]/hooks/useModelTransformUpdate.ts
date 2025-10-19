import { useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { Project } from "@backend/schemas/project.schema";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface ModelTransformUpdate {
  origin?: Vector3;
  scale?: Vector3;
  rotation?: Vector3;
}

export function useModelTransformUpdate(projectId: string) {
  const utils = trpc.useUtils();
  const updateModelTransformMutation =
    trpc.projects.updateModelTransform.useMutation({
      onMutate: async (newTransform) => {
        await utils.projects.get.cancel({ projectId });

        const previousProject = utils.projects.get.getData({ projectId });

        utils.projects.get.setData({ projectId }, (old: Project) => {
          if (!old) return old;
          return {
            ...old,
            modelTransform: {
              origin: newTransform.origin ||
                old.modelTransform?.origin || { x: 0, y: 0, z: 0 },
              scale: newTransform.scale ||
                old.modelTransform?.scale || { x: 1, y: 1, z: 1 },
              rotation: newTransform.rotation ||
                old.modelTransform?.rotation || { x: 0, y: 0, z: 0 },
            },
          };
        });

        return { previousProject };
      },
      onError: (err, newTransform, context) => {
        if (context?.previousProject) {
          utils.projects.get.setData({ projectId }, context.previousProject);
        }
      },
      onSettled: () => {
        utils.projects.get.invalidate({ projectId });
      },
    });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestTransformRef = useRef<ModelTransformUpdate | null>(null);

  const updateModelTransform = useCallback(
    (origin?: Vector3, scale?: Vector3, rotation?: Vector3) => {
      latestTransformRef.current = { origin, scale, rotation };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (latestTransformRef.current) {
          updateModelTransformMutation.mutate({
            projectId,
            origin: latestTransformRef.current.origin,
            scale: latestTransformRef.current.scale,
            rotation: latestTransformRef.current.rotation,
          });
        }
      }, 500);
    },
    [projectId, updateModelTransformMutation],
  );

  return { updateModelTransform };
}
