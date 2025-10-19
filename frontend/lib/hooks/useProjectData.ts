import { Project } from "@backend/schemas/project.schema";
import { trpc } from "../trpc/client";

export function useProjectData(projectId: string) {
  const [project, query] = trpc.projects.get.useSuspenseQuery<Project>(
    {
      projectId,
    },
    {
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: true,
    },
  );

  return { project, query };
}
