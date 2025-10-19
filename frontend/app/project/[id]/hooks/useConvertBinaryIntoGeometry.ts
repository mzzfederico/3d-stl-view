import { useEffect, useState } from "react";
import { BufferGeometry } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export default function useConvertBinaryIntoGeometry(
  stlData?: string,
): BufferGeometry | null {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    if (!stlData) {
      setGeometry(null);
      return;
    }

    const binaryString = atob(stlData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    const loader = new STLLoader();
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);

    loader.load(
      url,
      (loadedGeometry) => {
        setGeometry(loadedGeometry);
        URL.revokeObjectURL(url);
      },
      undefined,
      (error) => {
        console.error("Error loading STL:", error);
        URL.revokeObjectURL(url);
      },
    );

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [stlData]);

  return geometry;
}
