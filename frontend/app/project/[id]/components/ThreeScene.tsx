"use client";

import { useProjectData } from "@/lib/hooks/useProjectData";
import { Project } from "@backend/schemas/project.schema";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCameraUpdate } from "../hooks/useCameraUpdate";
import { useAnnotations } from "../hooks/useAnnotations";
import { useUserContext } from "@/lib/context/UserContext";
import STLDropzone from "./STLDropzone";
import STLModel from "./STLModel";
import { CameraController } from "./CameraController";
import { AnnotationPopupOverlay, AnnotationCreatorOverlay, HoveredAnnotation, CreatingAnnotation } from "./annotations";
import { vec3, euler } from "@/lib/three-utils";

export default function ThreeScene() {
  const router = useRouter();
  const { id: projectId } = useParams<{ id: string }>();
  const { userId } = useUserContext();
  const [hoveredAnnotation, setHoveredAnnotation] =
    useState<HoveredAnnotation | null>(null);
  const [creatingAnnotation, setCreatingAnnotation] =
    useState<CreatingAnnotation | null>(null);

  useEffect(() => {
    if (!projectId) router.push("/not-found");
  });

  const { project } = useProjectData(projectId);
  const { updateCamera } = useCameraUpdate(projectId);
  const { addAnnotation, editAnnotation, deleteAnnotation, loadUserName } =
    useAnnotations(projectId, userId);

  const handleCreateAnnotation = (
    text: string,
    vertex: { x: number; y: number; z: number },
  ) => {
    addAnnotation(text, vertex);
    setCreatingAnnotation(null);
  };

  return (
    <div className="absolute inset-0 bg-gray-900">
      <STLDropzone projectId={projectId} hasSTL={!!project.stlFile} />

      <Canvas className="w-full h-full">
        <CameraController />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        {/* STL Model with annotations */}
        <STLModel
          stlData={project.stlFile}
          projectId={projectId}
          modelTransform={project.modelTransform}
          annotations={project.annotations || []}
          currentUserId={userId}
          addAnnotation={addAnnotation}
          editAnnotation={editAnnotation}
          deleteAnnotation={deleteAnnotation}
          loadUserName={loadUserName}
          onHoverChange={setHoveredAnnotation}
          onCreatingChange={setCreatingAnnotation}
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
          enabled={!hoveredAnnotation && !creatingAnnotation}
          onChange={(e) => {
            // Only update camera if controls are enabled and user is actually moving
            if (e?.target && !hoveredAnnotation && !creatingAnnotation) {
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

      {/* Render overlays outside Canvas */}
      {hoveredAnnotation && (
        <AnnotationPopupOverlay
          text={hoveredAnnotation.annotation.text}
          userId={hoveredAnnotation.annotation.userId}
          userName={hoveredAnnotation.annotation.userName}
          annotationId={hoveredAnnotation.annotationId}
          currentUserId={userId}
          screenX={hoveredAnnotation.screenX}
          screenY={hoveredAnnotation.screenY}
          onEdit={editAnnotation}
          onDelete={deleteAnnotation}
          onLoadUserName={loadUserName}
          onClose={() => setHoveredAnnotation(null)}
        />
      )}

      {creatingAnnotation && (
        <AnnotationCreatorOverlay
          screenX={creatingAnnotation.screenX}
          screenY={creatingAnnotation.screenY}
          vertex={creatingAnnotation.vertex}
          onSave={handleCreateAnnotation}
          onCancel={() => setCreatingAnnotation(null)}
        />
      )}
    </div>
  );
}
