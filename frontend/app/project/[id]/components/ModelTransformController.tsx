"use client";

import { useRef } from "react";
import { Mesh, Euler, Vector3, Matrix4, Quaternion } from "three";
import { PivotControls } from "@react-three/drei";
import { useModelTransformUpdate } from "../hooks/useModelTransformUpdate";
import { useMode, ApplicationMode } from "@/lib/context/useModes";
import { vec3, euler } from "@/lib/three-utils";

interface ModelTransformControllerProps {
  meshRef: React.RefObject<Mesh | null>;
  projectId: string;
  modelTransform?: {
    origin: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
  children: React.ReactNode;
}

export default function ModelTransformController({
  projectId,
  modelTransform,
  children,
}: ModelTransformControllerProps) {
  const { updateModelTransform } = useModelTransformUpdate(projectId);
  const { currentMode } = useMode();
  const latestTransformRef = useRef<Matrix4 | null>(null);

  const handleDrag = (localMatrix: Matrix4) => {
    // Store the latest local matrix during drag
    latestTransformRef.current = localMatrix.clone();
  };

  const handleDragEnd = () => {
    if (!latestTransformRef.current) return;

    // Decompose the local matrix to get position, rotation, and scale
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();

    latestTransformRef.current.decompose(position, quaternion, scale);
    const rotation = new Euler().setFromQuaternion(quaternion);

    updateModelTransform(
      { ...position },
      { ...scale },
      { x: rotation.x, y: rotation.y, z: rotation.z },
    );
  };

  // Create initial matrix from modelTransform
  const initialMatrix = new Matrix4();
  if (modelTransform) {
    const pos = vec3(modelTransform.origin);
    const rot = euler(modelTransform.rotation);
    const scl = vec3(modelTransform.scale);
    initialMatrix.compose(pos, new Quaternion().setFromEuler(rot), scl);
  }

  // Only enable controls in Transform mode
  const isTransformMode = currentMode === ApplicationMode.Transform;

  return (
    <PivotControls
      enabled={isTransformMode}
      visible={isTransformMode}
      anchor={[0, 0, 0]}
      matrix={initialMatrix}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      depthTest={false}
      scale={0.3}
      autoTransform={true}
    >
      {children}
    </PivotControls>
  );
}
