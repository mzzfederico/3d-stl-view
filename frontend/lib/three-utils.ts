import { Vector3, Euler } from "three";

/**
 * Helper type for objects with x, y, z numeric properties
 */
export type Vec3Like = {
  x: number;
  y: number;
  z: number;
};

/**
 * Creates a Three.js Vector3 from an object with x, y, z properties
 * @param vec - Object with x, y, z properties
 * @returns A new Vector3 instance
 *
 * @example
 * const position = vec3({ x: 1, y: 2, z: 3 });
 */
export function vec3(vec: Vec3Like): Vector3 {
  return new Vector3(vec.x, vec.y, vec.z);
}

/**
 * Creates a Three.js Euler from an object with x, y, z properties
 * @param euler - Object with x, y, z properties (in radians)
 * @returns A new Euler instance
 *
 * @example
 * const rotation = euler({ x: 0, y: Math.PI / 2, z: 0 });
 */
export function euler(euler: Vec3Like): Euler {
  return new Euler(euler.x, euler.y, euler.z);
}
