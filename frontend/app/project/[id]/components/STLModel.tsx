import { useEffect, useState, useRef } from "react";
import { BufferGeometry, Mesh } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useThree } from "@react-three/fiber";
import { useMouseNearbyVertices } from "../hooks/useMouseNearbyVertices";
import useGeometryVertex from "../hooks/useGeometryVertex";
import useConvertBinaryIntoGeometry from "../hooks/useConvertBinaryIntoGeometry";

interface STLModelProps {
  stlData?: string;
}

export default function STLModel({ stlData }: STLModelProps) {
  const meshRef = useRef<Mesh>(null);
  const geometry = useConvertBinaryIntoGeometry(stlData);
  const vertices = useGeometryVertex(geometry);
  const nearestVertex = useMouseNearbyVertices({
    vertices,
    mesh: meshRef.current,
  });

  if (!geometry) {
    return null;
  }

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <primitive attach="geometry" object={geometry}></primitive>
        <meshStandardMaterial color="#4287f5" />
      </mesh>
      {nearestVertex && (
        <mesh position={[nearestVertex.x, nearestVertex.y, nearestVertex.z]}>
          <sphereGeometry args={[0.01]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </>
  );
}
