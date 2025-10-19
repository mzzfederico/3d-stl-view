import { useMemo } from "react";
import { BufferGeometry, Vector3, Matrix4, Euler, Quaternion } from "three";

interface ModelTransform {
  origin: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export default function useGeometryVertex(
  geometry: BufferGeometry | null,
  modelTransform?: ModelTransform
) {
  return useMemo(() => {
    if (!geometry) return [];

    const positionAttribute = geometry.getAttribute("position");
    const allVertex: Vector3[] = [];

    // Create transformation matrix from modelTransform
    const transformMatrix = new Matrix4();
    if (modelTransform) {
      const pos = new Vector3(
        modelTransform.origin.x,
        modelTransform.origin.y,
        modelTransform.origin.z
      );
      const rot = new Euler(
        modelTransform.rotation.x,
        modelTransform.rotation.y,
        modelTransform.rotation.z
      );
      const scl = new Vector3(
        modelTransform.scale.x,
        modelTransform.scale.y,
        modelTransform.scale.z
      );
      transformMatrix.compose(pos, new Quaternion().setFromEuler(rot), scl);
    }

    for (
      let vertexIndex = 0;
      vertexIndex < positionAttribute.count;
      vertexIndex++
    ) {
      const vertex = new Vector3().fromBufferAttribute(
        positionAttribute,
        vertexIndex
      );

      // Apply transformation if modelTransform is provided
      if (modelTransform) {
        vertex.applyMatrix4(transformMatrix);
      }

      allVertex[vertexIndex] = vertex;
    }

    return allVertex;
  }, [geometry, modelTransform]);
}
