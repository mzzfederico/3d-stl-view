"use client";

import { useRef, useEffect } from "react";
import { Mesh, Euler, Vector3, Matrix4, Quaternion } from "three";
import { PivotControls } from "@react-three/drei";
import { useModelTransformUpdate } from "../hooks/useModelTransformUpdate";
import { useMode, MODES } from "@/lib/context/useModes";

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
  meshRef,
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
    const pos = new Vector3(
      modelTransform.origin.x,
      modelTransform.origin.y,
      modelTransform.origin.z,
    );
    const rot = new Euler(
      modelTransform.rotation.x,
      modelTransform.rotation.y,
      modelTransform.rotation.z,
    );
    const scl = new Vector3(
      modelTransform.scale.x,
      modelTransform.scale.y,
      modelTransform.scale.z,
    );
    initialMatrix.compose(pos, new Quaternion().setFromEuler(rot), scl);
  }

  // Only enable controls in Transform mode
  const isTransformMode = currentMode === MODES.Transform;

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
