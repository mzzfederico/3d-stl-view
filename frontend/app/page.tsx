"use client";

import { CreateProjectDialog, ProjectsTable, UserTag } from "./components";

export default function Home() {
  return (
    <div className="container mx-auto px-3 py-10">
      <div className="flex justify-between items-center mb-6">
        <UserTag />
        <CreateProjectDialog />
      </div>

      <ProjectsTable />
    </div>
  );
}
