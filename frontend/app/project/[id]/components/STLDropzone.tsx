"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Project } from "@backend/schemas/project.schema";
import { trpc } from "@/lib/trpc/client";
import { match } from "ts-pattern";
import { vec3 } from "@/lib/three-utils";
import { useToast } from "@/hooks/use-toast";

interface STLDropzoneProps {
  projectId: Project["id"];
  hasSTL: boolean;
}

export default function STLDropzone({ projectId, hasSTL }: STLDropzoneProps) {
  const utils = trpc.useUtils();
  const uploadSTLMutation = trpc.projects.uploadSTL.useMutation();
  const updateTransform = trpc.projects.updateModelTransform.useMutation();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsDraggingFile(false);
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.name.toLowerCase().endsWith(".stl")) {
          try {
            const arrayBuffer = await file.arrayBuffer();

            const base64 = btoa(
              new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                "",
              ),
            );

            await uploadSTLMutation.mutateAsync({
              projectId,
              stlFile: base64,
            });

            await updateTransform.mutateAsync({
              projectId,
              origin: vec3({ x: 0, y: 0, z: 0 }),
              scale: vec3({ x: 1, y: 1, z: 1 }),
              rotation: vec3({ x: 0, y: 0, z: 0 }),
            });

            await utils.projects.get.invalidate({ projectId });

            toast({
              title: "Model uploaded!",
              description: `${file.name} has been successfully uploaded.`,
            });
          } catch (error) {
            console.error("Failed to upload STL:", error);
            toast({
              title: "Upload failed",
              description: "Could not upload the STL file. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    },
    [projectId, uploadSTLMutation, updateTransform, utils, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "application/sla": [".stl"],
    },
    multiple: false,
    noClick: hasSTL && !isDraggingFile,
  });

  // Detect file dragging at window level
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter++;
        setIsDraggingFile(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDraggingFile(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingFile(false);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", handleDragOver);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", handleDragOver);
    };
  }, []);

  const isActivelyDragging = isDragActive || isDraggingFile;

  const content = match<{
    isPending: boolean;
    isError: boolean;
    isActivelyDragging: boolean;
    hasSTL: boolean;
  }>({
    isPending: uploadSTLMutation.isPending,
    isError: uploadSTLMutation.isError,
    isActivelyDragging,
    hasSTL,
  })
    .with({ isPending: true }, () => (
      <div className="bg-white/90 rounded-lg p-8 shadow-lg">
        <p className="text-xl font-semibold text-gray-800">
          Uploading STL file...
        </p>
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="bg-red-500/90 rounded-lg p-8 shadow-lg">
        <p className="text-xl font-semibold text-white">
          Error: {uploadSTLMutation?.error?.message}
        </p>
      </div>
    ))
    .with({ isActivelyDragging: true }, ({ hasSTL }) => (
      <div className="bg-white/90 rounded-lg p-8 shadow-lg">
        <p className="text-xl font-semibold text-gray-800">
          Drop STL file here to {hasSTL ? "replace" : "upload"}
        </p>
      </div>
    ))
    .with({ hasSTL: false }, () => (
      <div className="bg-gray-800/80 rounded-lg p-8 shadow-lg cursor-pointer hover:bg-gray-700/80 transition-colors">
        <p className="text-xl font-semibold text-white text-center">
          Click or drag STL file here to upload
        </p>
      </div>
    ))
    .otherwise(() => null);

  const showOverlay =
    !hasSTL ||
    isActivelyDragging ||
    uploadSTLMutation.isPending ||
    uploadSTLMutation.isError;

  return (
    <div
      {...getRootProps()}
      className={`
        absolute inset-0 z-20
        flex items-center justify-center
        ${showOverlay ? "pointer-events-auto" : "pointer-events-none"}
        ${isActivelyDragging ? "bg-blue-500/20 backdrop-blur-sm" : ""}
      `}
    >
      <input {...getInputProps()} />
      {content}
    </div>
  );
}
