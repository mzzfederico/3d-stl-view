import { useRef, useEffect } from "react";
import { Mesh, Euler, Vector3 } from "three";
import { useMouseNearbyVertices } from "../hooks/useMouseNearbyVertices";
import useGeometryVertex from "../hooks/useGeometryVertex";
import useConvertBinaryIntoGeometry from "../hooks/useConvertBinaryIntoGeometry";
import ModelTransformController from "./ModelTransformController";
import { useMode, MODES } from "@/lib/context/useModes";

import { VertexIndicator } from "./VertexIndicator";
import { AnnotationScene, AnnotationSceneRef, HoveredAnnotation, CreatingAnnotation } from "./annotations";

interface Annotation {
  text: string;
  userId: string;
  vertex: { x: number; y: number; z: number };
  timestamp: Date;
  userName?: string;
}

interface STLModelProps {
  stlData?: string;
  projectId: string;
  modelTransform?: {
    origin: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
  annotations?: Annotation[];
  currentUserId: string;
  addAnnotation: (text: string, vertex: { x: number; y: number; z: number }) => void;
  editAnnotation: (annotationId: string, newText: string) => void;
  deleteAnnotation: (annotationId: string) => void;
  loadUserName: (userId: string) => Promise<string>;
  onHoverChange: (hover: HoveredAnnotation | null) => void;
  onCreatingChange: (creating: CreatingAnnotation | null) => void;
}

export default function STLModel({
  stlData,
  projectId,
  modelTransform,
  annotations = [],
  currentUserId,
  addAnnotation,
  editAnnotation,
  deleteAnnotation,
  loadUserName,
  onHoverChange,
  onCreatingChange,
}: STLModelProps) {
  const meshRef = useRef<Mesh>(null);
  const annotationSceneRef = useRef<AnnotationSceneRef>(null);
  const geometry = useConvertBinaryIntoGeometry(stlData);
  // Don't pass modelTransform - vertices should be in local space
  // because the mesh is transformed by PivotControls
  const vertices = useGeometryVertex(geometry);
  const { currentMode } = useMode();

  const nearestVertex = useMouseNearbyVertices({
    vertices,
    mesh: meshRef.current,
    enabled: currentMode === MODES.Note,
  });

  const handleVertexClick = () => {
    annotationSceneRef.current?.startCreation();
  };

  if (!geometry) {
    return null;
  }

  return (
    <>
      <ModelTransformController
        meshRef={meshRef}
        projectId={projectId}
        modelTransform={modelTransform}
      >
        <mesh ref={meshRef}>
          <primitive attach="geometry" object={geometry}></primitive>
          <meshStandardMaterial color="#4287f5" />
        </mesh>

        {/* Vertex Indicator - inherits model transform */}
        <VertexIndicator
          vertex={
            nearestVertex
              ? { x: nearestVertex.x, y: nearestVertex.y, z: nearestVertex.z }
              : null
          }
          onClick={handleVertexClick}
        />
      </ModelTransformController>

      {/* Annotations - rendered outside transform controller to prevent distortion */}
      <AnnotationScene
        ref={annotationSceneRef}
        projectId={projectId}
        currentUserId={currentUserId}
        annotations={annotations}
        modelTransform={modelTransform}
        nearestVertex={
          nearestVertex
            ? { x: nearestVertex.x, y: nearestVertex.y, z: nearestVertex.z }
            : null
        }
        addAnnotation={addAnnotation}
        editAnnotation={editAnnotation}
        deleteAnnotation={deleteAnnotation}
        loadUserName={loadUserName}
        onHoverChange={onHoverChange}
        onCreatingChange={onCreatingChange}
      />
    </>
  );
}
