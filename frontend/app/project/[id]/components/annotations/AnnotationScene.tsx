"use client";

import { useImperativeHandle, forwardRef, useMemo } from "react";
import { Annotations } from "./Annotations";
import { useThree } from "@react-three/fiber";
import { vec3, euler } from "@/lib/three-utils";
import { Matrix4, Quaternion, Vector3 } from "three";
import { AnnotationProvider, HoveredAnnotation, CreatingAnnotation, useAnnotationContext } from "./AnnotationContext";

interface Annotation {
  text: string;
  userId: string;
  vertex: { x: number; y: number; z: number };
  timestamp: Date;
  userName?: string;
}

interface AnnotationSceneProps {
  annotations: Annotation[];
  modelTransform?: {
    origin: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
  nearestVertex: { x: number; y: number; z: number } | null;
}

export interface AnnotationSceneRef {
  startCreation: () => void;
}

const AnnotationSceneContent = forwardRef<
  AnnotationSceneRef,
  AnnotationSceneProps
>(function AnnotationSceneContent(
  {
    annotations,
    modelTransform,
    nearestVertex,
  },
  ref,
) {
  const { camera, size } = useThree();
  const { onCreatingChange } = useAnnotationContext();

  const transformMatrix = useMemo(() => {
    if (!modelTransform) {
      return new Matrix4();
    }
    const pos = vec3(modelTransform.origin);
    const rot = euler(modelTransform.rotation);
    const scl = vec3(modelTransform.scale);
    const matrix = new Matrix4();
    matrix.compose(pos, new Quaternion().setFromEuler(rot), scl);
    return matrix;
  }, [modelTransform]);

  const transformedAnnotations = useMemo(() => {
    return annotations.map((annotation) => {
      const localVertex = new Vector3(
        annotation.vertex.x,
        annotation.vertex.y,
        annotation.vertex.z
      );
      const worldVertex = localVertex.applyMatrix4(transformMatrix);
      return {
        ...annotation,
        worldVertex: { x: worldVertex.x, y: worldVertex.y, z: worldVertex.z },
      };
    });
  }, [annotations, transformMatrix]);

  const getScreenPosition = (vertex: { x: number; y: number; z: number }) => {
    const vector = vec3(vertex);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (-(vector.y * 0.5) + 0.5) * size.height;

    return { x, y };
  };

  const handleStartCreation = () => {
    if (nearestVertex) {
      const { x, y } = getScreenPosition(nearestVertex);
      onCreatingChange({ vertex: nearestVertex, screenX: x, screenY: y });
    }
  };

  useImperativeHandle(ref, () => ({
    startCreation: handleStartCreation,
  }));

  return <Annotations annotations={transformedAnnotations} />;
});

interface AnnotationSceneWrapperProps extends AnnotationSceneProps {
  projectId: string;
  currentUserId: string;
  addAnnotation: (text: string, vertex: { x: number; y: number; z: number }) => void;
  editAnnotation: (annotationId: string, newText: string) => void;
  deleteAnnotation: (annotationId: string) => void;
  loadUserName: (userId: string) => Promise<string>;
  onHoverChange: (hover: HoveredAnnotation | null) => void;
  onCreatingChange: (creating: CreatingAnnotation | null) => void;
}

export const AnnotationScene = forwardRef<AnnotationSceneRef, AnnotationSceneWrapperProps>(
  function AnnotationScene(props, ref) {
    const {
      projectId,
      currentUserId,
      addAnnotation,
      editAnnotation,
      deleteAnnotation,
      loadUserName,
      onHoverChange,
      onCreatingChange,
      ...contentProps
    } = props;

    return (
      <AnnotationProvider
        value={{
          projectId,
          currentUserId,
          addAnnotation,
          editAnnotation,
          deleteAnnotation,
          loadUserName,
          onHoverChange,
          onCreatingChange,
        }}
      >
        <AnnotationSceneContent ref={ref} {...contentProps} />
      </AnnotationProvider>
    );
  }
);
