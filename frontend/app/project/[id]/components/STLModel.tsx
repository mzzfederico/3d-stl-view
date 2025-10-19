import { useRef } from "react";
import { Mesh, Euler, Vector3 } from "three";
import { useMouseNearbyVertices } from "../hooks/useMouseNearbyVertices";
import useGeometryVertex from "../hooks/useGeometryVertex";
import useConvertBinaryIntoGeometry from "../hooks/useConvertBinaryIntoGeometry";
import ModelTransformController from "./ModelTransformController";
import { useMode, MODES } from "@/lib/context/useModes";

interface STLModelProps {
  stlData?: string;
  projectId: string;
  modelTransform?: {
    origin: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
}

export default function STLModel({
  stlData,
  projectId,
  modelTransform,
}: STLModelProps) {
  const meshRef = useRef<Mesh>(null);
  const geometry = useConvertBinaryIntoGeometry(stlData);
  // Don't pass modelTransform - vertices should be in local space
  // because the mesh is transformed by PivotControls
  const vertices = useGeometryVertex(geometry);
  const { currentMode } = useMode();

  const nearestVertex = useMouseNearbyVertices({
    vertices,
    mesh: meshRef.current,
  });

  if (!geometry) {
    return null;
  }

  // Only show nearest vertex indicator in Note mode
  const showNearestVertex = currentMode === MODES.Note && nearestVertex;

  return (
    <ModelTransformController
      meshRef={meshRef}
      projectId={projectId}
      modelTransform={modelTransform}
    >
      <mesh ref={meshRef}>
        <primitive attach="geometry" object={geometry}></primitive>
        <meshStandardMaterial color="#4287f5" />
      </mesh>
      {showNearestVertex && (
        <mesh position={[nearestVertex.x, nearestVertex.y, nearestVertex.z]}>
          <sphereGeometry args={[0.01]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </ModelTransformController>
  );
}
