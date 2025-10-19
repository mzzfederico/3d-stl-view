import { Project } from "@backend/schemas/project.schema";
import { trpc } from "../trpc/client";

export function useProjectData(projectId: string) {
  const [project, query] = trpc.projects.get.useSuspenseQuery<Project>(
    {
      projectId,
    },
    {
      refetchOnWindowFocus: false, // Rely on WebSocket updates instead
      refetchOnMount: false, // Don't refetch on component mount
      refetchIntervalInBackground: false,
      staleTime: Infinity, // Data never goes stale - we update via WebSocket
    },
  );

  return { project, query };
}
