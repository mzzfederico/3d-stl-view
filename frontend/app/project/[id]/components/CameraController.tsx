"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useMemo } from "react";
import { vec3, euler } from "@/lib/three-utils";
import { useProjectData } from "@/lib/hooks/useProjectData";
import { useParams } from "next/navigation";

export function CameraController() {
  const { id: projectId } = useParams<{ id: string }>();
  const { project } = useProjectData(projectId);

  // Only update camera when position/rotation props actually change
  const { pos, rot } = useMemo(() => {
    const pos = vec3(project.camera.position);
    const rot = euler(project.camera.rotation);

    return { pos, rot };
  }, [project]);

  return <PerspectiveCamera makeDefault position={pos} rotation={rot} />;
}
