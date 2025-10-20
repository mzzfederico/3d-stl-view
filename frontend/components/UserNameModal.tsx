"use client";

import { useCallback, useState } from "react";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BaseModalProps } from "@/lib/types/modal";
import { match } from "ts-pattern";
import { useUserContext } from "@/lib/context/UserContext";

export type UserNameModalMode = "create" | "edit";

export interface UserNameModalProps extends BaseModalProps {
  mode: UserNameModalMode;
  onSubmit: (name: string) => void;
  canDismiss: boolean;
}

export default function UserNameModal({
  open,
  setOpen,
  mode,
  onSubmit,
  canDismiss,
}: UserNameModalProps) {
  const user = useUserContext();
  const [name, setName] = useState(user.userName ?? "");

  const generateRandomName = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: " ",
      style: "capital",
    });
  };


  const handleSubmit = useCallback(() => {
    const finalName = name.trim() || generateRandomName();
    onSubmit(finalName);
    setName("");
    setOpen(false);
  }, [name, onSubmit, setOpen]);

  const handleSkip = useCallback(() => {
    const randomName = generateRandomName();
    onSubmit(randomName);
    setName("");
    setOpen(false);
  }, [onSubmit, setOpen]);

  const dialogHeader = match(mode)
    .with("create", () => ({
      title: "Welcome",
      description: "Please enter your name to get started, or skip.",
    }))
    .with("edit", () => ({
      title: "Edit Name",
      description: "Update your display name.",
    }))
    .exhaustive();

  const actionButton = match(mode)
    .with("create", () => (
      <Button variant="outline" onClick={handleSkip}>
        Skip (Random Name)
      </Button>
    ))
    .with("edit", () => (
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    ))
    .exhaustive();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={(e) => !canDismiss && e.preventDefault()}
        onPointerDownOutside={(e) => !canDismiss && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{dialogHeader.title}</DialogTitle>
          <DialogDescription>{dialogHeader.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          {actionButton}
          <Button onClick={handleSubmit}>
            {name.trim() ? "Continue" : "Generate Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
