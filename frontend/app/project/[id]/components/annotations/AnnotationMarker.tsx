"use client";

import { useRef, useState } from "react";
import { Vector3 } from "three";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface AnnotationMarkerProps {
  position: Vector3;
  annotationId: string;
  onClick: (annotationId: string, screenX: number, screenY: number) => void;
  isOpen: boolean;
}

export function AnnotationMarker({
  position,
  annotationId,
  onClick,
  isOpen,
}: AnnotationMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const [isHovered, setIsHovered] = useState(false);

  const getScreenPosition = () => {
    if (!groupRef.current) return { x: 0, y: 0 };

    const vector = position.clone();
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (-(vector.y * 0.5) + 0.5) * size.height;

    return { x, y };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { x, y } = getScreenPosition();
    onClick(annotationId, x, y);
  };

  const getColor = () => {
    if (isOpen) return "#3b82f6";
    if (isHovered) return "#4b5563";
    return "#1f2937";
  };

  return (
    <group position={position} ref={groupRef}>
      <Html center>
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: isHovered ? "36px" : "30px",
            height: isHovered ? "36px" : "30px",
            borderRadius: "50%",
            backgroundColor: getColor(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "width 0.2s ease, height 0.2s ease",
            opacity: 0.95,
            pointerEvents: "auto",
            userSelect: "none",
          }}
        >
          <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>
            i
          </span>
        </div>
      </Html>
    </group>
  );
}
