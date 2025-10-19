"use client";

import { useProjectData } from "@/lib/hooks/useProjectData";
import { Project } from "@backend/schemas/project.schema";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Euler, Vector3 } from "three";
import { useCameraUpdate } from "../hooks/useCameraUpdate";
import STLDropzone from "./STLDropzone";
import STLModel from "./STLModel";

interface ThreeSceneProps {
  projectId: Project["id"];
}

export default function ThreeScene({ projectId }: ThreeSceneProps) {
  const router = useRouter();

  useEffect(() => {
    if (!projectId) router.push("/not-found");
  });

  const { project } = useProjectData(projectId);
  const { updateCamera } = useCameraUpdate(projectId);

  return (
    <div className="flex-1 bg-gray-900 relative">
      <STLDropzone projectId={projectId} hasSTL={!!project.stlFile} />

      <Canvas className="absolute inset-0 z-0">
        <PerspectiveCamera
          makeDefault
          position={
            new Vector3(
              project.camera.position.x,
              project.camera.position.y,
              project.camera.position.z,
            )
          }
          rotation={
            new Euler(
              project.camera.rotation.x,
              project.camera.rotation.y,
              project.camera.rotation.z,
            )
          }
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        {/* STL Model */}
        <STLModel stlData={project.stlFile} />

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
