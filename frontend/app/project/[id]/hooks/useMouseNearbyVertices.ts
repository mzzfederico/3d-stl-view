import { useThree } from "@react-three/fiber";
import { useState, useEffect, useRef } from "react";
import { Vector2, Vector3, Raycaster, Mesh } from "three";

interface UseMouseNearbyVerticesOptions {
  vertices: Vector3[];
  mesh: Mesh | null;
  enabled?: boolean;
}

export function useMouseNearbyVertices({
  vertices,
  mesh,
  enabled = true,
}: UseMouseNearbyVerticesOptions) {
  const { camera, gl } = useThree();
  const canvas = gl.domElement;

  const [nearestVertex, setNearestVertex] = useState<Vector3 | null>(null);
  const raycasterRef = useRef(new Raycaster());
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mesh || vertices.length === 0 || !canvas) {
      setNearestVertex(null);
      return;
    }

    if (!enabled) {
      setNearestVertex(null);
      return;
    }

    const findNearestVertexToPoint = (point: Vector3): Vector3 | null => {
      const { x: x0, y: y0, z: z0 } = point;
      let minDistance = Infinity;
      let nearestVertex: Vector3 | null = null;

      for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];

        // Transform vertex to world space
        const worldVertex = vertex.clone();
        mesh.localToWorld(worldVertex);

        const { x: x1, y: y1, z: z1 } = worldVertex;
        const distance = Math.sqrt(
          Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2) + Math.pow(z1 - z0, 2),
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestVertex = vertex; // Return the original local space vertex
        }
      }

      return nearestVertex;
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Store last mouse position
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };

      // Get canvas bounding rectangle
      const rect = canvas.getBoundingClientRect();

      // Convert mouse position to normalized device coordinates (-1 to +1)
      // relative to the canvas element
      const coords: Vector2 = new Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );

      // Update raycaster
      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(coords, camera);

      // Raycast against the mesh
      const intersects = raycaster.intersectObject(mesh, true);

      if (intersects.length > 0) {
        // Get the intersection point
        const intersectionPoint = intersects[0].point;

        // Find the nearest vertex to this intersection point
        const nearest = findNearestVertexToPoint(intersectionPoint);
        setNearestVertex(nearest);
      } else {
        setNearestVertex(null);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // When enabled becomes true (switching to Note mode), use last mouse position
    // or center of canvas to trigger immediate calculation
    requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect();
      const clientX = lastMousePosRef.current?.x ?? rect.left + rect.width / 2;
      const clientY = lastMousePosRef.current?.y ?? rect.top + rect.height / 2;

      const syntheticEvent = new MouseEvent("mousemove", {
        clientX,
        clientY,
      });
      handleMouseMove(syntheticEvent);
    });

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [vertices, mesh, camera, canvas, enabled]);

  return nearestVertex;
}
