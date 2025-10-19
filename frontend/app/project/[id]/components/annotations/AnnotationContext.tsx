"use client";

import { createContext, useContext, ReactNode } from "react";

interface Annotation {
  text: string;
  userId: string;
  vertex: { x: number; y: number; z: number };
  worldVertex?: { x: number; y: number; z: number };
  timestamp: Date;
  userName?: string;
}

export interface HoveredAnnotation {
  annotationId: string;
  annotation: Annotation;
  screenX: number;
  screenY: number;
}

export interface CreatingAnnotation {
  vertex: { x: number; y: number; z: number };
  screenX: number;
  screenY: number;
}

interface AnnotationContextValue {
  projectId: string;
  currentUserId: string;
  addAnnotation: (text: string, vertex: { x: number; y: number; z: number }) => void;
  editAnnotation: (annotationId: string, newText: string) => void;
  deleteAnnotation: (annotationId: string) => void;
  loadUserName: (userId: string) => Promise<string>;
  onHoverChange: (hover: HoveredAnnotation | null) => void;
  onCreatingChange: (creating: CreatingAnnotation | null) => void;
}

const AnnotationContext = createContext<AnnotationContextValue | null>(null);

export function AnnotationProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AnnotationContextValue;
}) {
  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
}

export function useAnnotationContext() {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error("useAnnotationContext must be used within AnnotationProvider");
  }
  return context;
}
