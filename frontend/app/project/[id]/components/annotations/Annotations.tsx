"use client";

import { useState } from "react";
import { AnnotationMarker } from "./AnnotationMarker";
import { vec3 } from "@/lib/three-utils";
import { useAnnotationContext } from "./AnnotationContext";

interface Annotation {
  text: string;
  userId: string;
  vertex: { x: number; y: number; z: number };
  worldVertex?: { x: number; y: number; z: number };
  timestamp: Date;
  userName?: string;
}

interface AnnotationsProps {
  annotations: Annotation[];
}

export function Annotations({ annotations }: AnnotationsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { onHoverChange } = useAnnotationContext();

  const handleClick = (
    annotationId: string,
    screenX: number,
    screenY: number,
  ) => {
    const annotation = annotations.find(
      (a) => `${a.userId}-${a.timestamp.getTime()}` === annotationId,
    );
    if (annotation) {
      setOpenId(annotationId);
      onHoverChange({ annotationId, annotation, screenX, screenY });
    }
  };

  return (
    <>
      {annotations.map((annotation) => {
        const annotationId = `${annotation.userId}-${annotation.timestamp.getTime()}`;
        const position = vec3(annotation.worldVertex || annotation.vertex);

        return (
          <AnnotationMarker
            key={annotationId}
            position={position}
            annotationId={annotationId}
            onClick={handleClick}
            isOpen={openId === annotationId}
          />
        );
      })}
    </>
  );
}
