import { useMemo } from "react";
import { BufferGeometry, Vector3 } from "three";

export default function useGeometryVertex(geometry: BufferGeometry | null) {
  return useMemo(() => {
    if (!geometry) return [];

    const positionAttribute = geometry.getAttribute("position");
    const allVertex: Vector3[] = [];

    for (
      let vertexIndex = 0;
      vertexIndex < positionAttribute.count;
      vertexIndex++
    ) {
      allVertex[vertexIndex] = new Vector3().fromBufferAttribute(
        positionAttribute,
        vertexIndex,
      );
    }

    return allVertex;
  }, [geometry]);
}
