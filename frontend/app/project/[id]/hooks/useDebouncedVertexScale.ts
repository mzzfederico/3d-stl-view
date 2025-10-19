import { useState, useEffect } from "react";
import { Camera } from "three";

interface UseDebouncedVertexScaleOptions {
  camera: Camera;
  debounceMs?: number;
}

export function useDebouncedVertexScale({
  camera,
  debounceMs = 150,
}: UseDebouncedVertexScaleOptions) {
  const [vertexScale, setVertexScale] = useState<number>(() => {
    // Initial calculation
    const magnitude = Math.sqrt(
      camera.position.x ** 2 +
        camera.position.y ** 2 +
        camera.position.z ** 2,
    );
    return 0.003 / (1 / magnitude);
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateVertexScale = () => {
      const magnitude = Math.sqrt(
        camera.position.x ** 2 +
          camera.position.y ** 2 +
          camera.position.z ** 2,
      );
      const newVertexScale = 0.003 / (1 / magnitude);
      setVertexScale(newVertexScale);
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVertexScale, debounceMs);
    };

    // Listen to camera position changes
    // Since Three.js doesn't have built-in events for position changes,
    // we'll use an interval to check for changes
    let lastPosition = camera.position.clone();

    const checkInterval = setInterval(() => {
      if (!camera.position.equals(lastPosition)) {
        lastPosition = camera.position.clone();
        debouncedUpdate();
      }
    }, 16); // Check roughly every frame (~60fps)

    return () => {
      clearTimeout(timeoutId);
      clearInterval(checkInterval);
    };
  }, [camera, debounceMs]);

  return vertexScale;
}
