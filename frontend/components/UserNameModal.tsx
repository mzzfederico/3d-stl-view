"use client";

import { useState } from "react";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
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

interface UserNameModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

export default function UserNameModal({ open, onSubmit }: UserNameModalProps) {
  const [name, setName] = useState("");

  const generateRandomName = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: " ",
      style: "capital",
    });
  };

  const handleSubmit = () => {
    const finalName = name.trim() || generateRandomName();
    onSubmit(finalName);
  };

  const handleSkip = () => {
    const randomName = generateRandomName();
    onSubmit(randomName);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to 3D Model Viewer</DialogTitle>
          <DialogDescription>
            Please enter your name to get started. You can skip and we'll generate a random name for you.
          </DialogDescription>
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
          <Button variant="outline" onClick={handleSkip}>
            Skip (Random Name)
          </Button>
          <Button onClick={handleSubmit}>
            {name.trim() ? "Continue" : "Generate Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
