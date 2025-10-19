"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { X } from "lucide-react";

interface AnnotationCreatorOverlayProps {
  screenX: number;
  screenY: number;
  vertex: { x: number; y: number; z: number };
  onSave: (text: string, vertex: { x: number; y: number; z: number }) => void;
  onCancel: () => void;
}

export function AnnotationCreatorOverlay({
  screenX,
  screenY,
  vertex,
  onSave,
  onCancel,
}: AnnotationCreatorOverlayProps) {
  const [text, setText] = useState("");

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, vertex);
      setText("");
    }
  };

  return (
    <div
      className="fixed z-50"
      style={{
        left: screenX + 15,
        top: screenY - 10,
      }}
    >
      <div className="bg-white border border-blue-400 rounded-lg shadow-lg p-3 w-[250px] z-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            New Annotation
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[60px] text-sm"
            placeholder="Enter your note here..."
            autoFocus
          />

          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!text.trim()}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
