import { useMemo } from "react";
import { BufferGeometry, Vector3, Matrix4, Quaternion } from "three";
import { vec3, euler } from "@/lib/three-utils";

interface ModelTransform {
  origin: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export default function useGeometryVertex(
  geometry: BufferGeometry | null,
  modelTransform?: ModelTransform,
) {
  return useMemo(() => {
    if (!geometry) return [];

    const positionAttribute = geometry.getAttribute("position");
    const allVertex: Vector3[] = [];

    // Create transformation matrix from modelTransform
    const transformMatrix = new Matrix4();
    if (modelTransform) {
      const pos = vec3(modelTransform.origin);
      const rot = euler(modelTransform.rotation);
      const scl = vec3(modelTransform.scale);
      transformMatrix.compose(pos, new Quaternion().setFromEuler(rot), scl);
    }

    for (
      let vertexIndex = 0;
      vertexIndex < positionAttribute.count;
      vertexIndex++
    ) {
      const vertex = new Vector3().fromBufferAttribute(
        positionAttribute,
        vertexIndex,
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
