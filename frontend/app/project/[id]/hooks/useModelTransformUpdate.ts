import { useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { useUserContext } from "@/lib/context/UserContext";
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
  const { userId } = useUserContext();
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
    });

  const latestTransformRef = useRef<ModelTransformUpdate | null>(null);

  const updateModelTransform = useCallback(
    (origin?: Vector3, scale?: Vector3, rotation?: Vector3) => {
      latestTransformRef.current = { origin, scale, rotation };

      updateModelTransformMutation.mutate({
        projectId,
        origin: latestTransformRef.current.origin,
        scale: latestTransformRef.current.scale,
        rotation: latestTransformRef.current.rotation,
        userId: userId || undefined,
      });
    },
    [projectId, userId, updateModelTransformMutation],
  );

  return { updateModelTransform };
}
