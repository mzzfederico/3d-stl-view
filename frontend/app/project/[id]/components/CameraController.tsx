"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { vec3, euler } from "@/lib/three-utils";
import { useProjectData } from "@/lib/hooks/useProjectData";
import { useParams } from "next/navigation";

interface CameraControllerProps {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

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
