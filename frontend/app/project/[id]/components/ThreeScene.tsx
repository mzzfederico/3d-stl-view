"use client";

import { useProjectData } from "@/lib/hooks/useProjectData";
import { Project } from "@backend/schemas/project.schema";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCameraUpdate } from "../hooks/useCameraUpdate";
import STLDropzone from "./STLDropzone";
import STLModel from "./STLModel";
import { vec3, euler } from "@/lib/three-utils";

export default function ThreeScene() {
  const router = useRouter();
  const { id: projectId } = useParams<{ id: string }>();

  useEffect(() => {
    if (!projectId) router.push("/not-found");
  });

  const { project } = useProjectData(projectId);
  const { updateCamera } = useCameraUpdate(projectId);

  return (
    <div className="absolute inset-0 bg-gray-900">
      <STLDropzone projectId={projectId} hasSTL={!!project.stlFile} />

      <Canvas className="w-full h-full">
        <PerspectiveCamera
          makeDefault
          position={vec3(project.camera.position)}
          rotation={euler(project.camera.rotation)}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        {/* STL Model */}
        <STLModel
          stlData={project.stlFile}
          projectId={projectId}
          modelTransform={project.modelTransform}
        />

        {/* Grid helper */}
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          onChange={(e) => {
            if (e?.target) {
              const camera = e.target.object;
              updateCamera(
                {
                  x: camera.position.x,
                  y: camera.position.y,
                  z: camera.position.z,
                },
                {
                  x: camera.rotation.x,
                  y: camera.rotation.y,
                  z: camera.rotation.z,
                },
              );
            }
          }}
        />
      </Canvas>
    </div>
  );
}
