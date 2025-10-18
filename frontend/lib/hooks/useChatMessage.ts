import { useCallback } from "react";
import { trpc } from "../trpc/client";
import { Project } from "@backend/schemas/project.schema";

export function useChatMessage(projectId: string) {
  const utils = trpc.useUtils();
  const addChatMessageMutation = trpc.projects.addChatMessage.useMutation({
    onMutate: async (newMessage) => {
      await utils.projects.get.cancel({ projectId });

      const previousProject = utils.projects.get.getData({ projectId });

      utils.projects.get.setData({ projectId }, (old: Project) => {
        if (!old) return old;
        return {
          ...old,
          chatLog: [
            ...old.chatLog,
            {
              userId: newMessage.userId,
              message: newMessage.message,
              timestamp: new Date(),
            },
          ],
        };
      });

      return { previousProject };
    },
    onError: (err, newMessage, context) => {
      if (context?.previousProject) {
        utils.projects.get.setData({ projectId }, context.previousProject);
      }
    },
    onSettled: () => {
      utils.projects.get.invalidate({ projectId });
    },
  });

  const sendMessage = useCallback(
    (userId: string, message: string) => {
      addChatMessageMutation.mutate({
        projectId,
        userId,
        message,
      });
    },
    [projectId, addChatMessageMutation],
  );

  return { sendMessage };
}
