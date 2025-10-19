"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface AnnotationPopupOverlayProps {
  text: string;
  userId: string;
  userName?: string;
  annotationId: string;
  currentUserId: string;
  screenX: number;
  screenY: number;
  onEdit: (annotationId: string, newText: string) => void;
  onDelete: (annotationId: string) => void;
  onLoadUserName: (userId: string) => Promise<string>;
  onClose: () => void;
}

export function AnnotationPopupOverlay({
  text,
  userId,
  userName: initialUserName,
  annotationId,
  currentUserId,
  screenX,
  screenY,
  onEdit,
  onDelete,
  onLoadUserName,
  onClose,
}: AnnotationPopupOverlayProps) {
  const [userName, setUserName] = useState(initialUserName || "Loading...");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    if (!initialUserName) {
      onLoadUserName(userId).then(setUserName);
    }
  }, [userId, initialUserName, onLoadUserName]);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(annotationId, editText);
      setIsEditing(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const isOwnAnnotation = userId === currentUserId;

  return (
    <div
      className="fixed z-50"
      style={{
        left: screenX + 15,
        top: screenY - 10,
      }}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-[250px]">
        {/* Header with user name and close button */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-500 font-medium">{userName}</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[60px] text-sm"
              placeholder="Enter annotation text..."
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!editText.trim()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
            {text}
          </div>
        )}

        {/* Actions - only show if user owns this annotation and not editing */}
        {isOwnAnnotation && !isEditing && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center gap-1 text-xs"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onDelete(annotationId);
                onClose();
              }}
              className="flex-1 flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
