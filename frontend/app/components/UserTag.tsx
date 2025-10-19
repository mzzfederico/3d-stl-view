import { useUserContext } from "@/lib/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalId, useModal } from "@/lib/context/ModalContext";

export function UserTag() {
  const { userName, updateName } = useUserContext();
  const { openModal } = useModal();

  const openNameModal = () => {
    openModal(ModalId.UserName, {
      mode: "edit",
      onSubmit: updateName,
      canDismiss: true,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={`https://github.com/${userName}.png`} />
        <AvatarFallback>{userName?.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{userName}</span>
      <Button size="icon" variant="ghost" onClick={openNameModal}>
        <PenBox />
      </Button>
    </div>
  );
}
