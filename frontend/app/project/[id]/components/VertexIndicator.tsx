"use client";

import { useMode, ApplicationMode } from "@/lib/context/useModes";
import { ThreeEvent } from "@react-three/fiber";

interface VertexIndicatorProps {
  vertex: { x: number; y: number; z: number } | null;
  onClick?: () => void;
}

export function VertexIndicator({ vertex, onClick }: VertexIndicatorProps) {
  const { currentMode } = useMode();

  if (!vertex || currentMode !== ApplicationMode.Note) {
    return null;
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <mesh
      position={[vertex.x, vertex.y, vertex.z]}
      scale={[0.5, 0.5, 0.5]}
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <sphereGeometry args={[0.02]} />
      <meshStandardMaterial
        color="red"
        emissive="red"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
