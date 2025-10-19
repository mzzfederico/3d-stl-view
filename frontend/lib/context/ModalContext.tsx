"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import UserNameModal, { UserNameModalProps } from "@/components/UserNameModal";
import CreateProjectModal, {
  CreateProjectModalProps,
} from "@/components/CreateProjectModal";
import { match } from "ts-pattern";

export const enum ModalId {
  UserName = "UserName",
  CreateProject = "CreateProject",
}

type ModalProps = {
  [ModalId.UserName]: Omit<UserNameModalProps, "open" | "setOpen">;
  [ModalId.CreateProject]: Omit<CreateProjectModalProps, "open" | "setOpen">;
};

type ModalType = keyof ModalProps;

interface ModalState {
  type: ModalType | null;
  props: ModalProps[ModalType] | null;
}

interface ModalContextValue {
  openModal: <T extends ModalType>(type: T, props: ModalProps[T]) => void;
  closeModal: () => void;
  isOpen: (type: ModalType) => boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    props: null,
  });

  const openModal = useCallback(
    <T extends ModalType>(type: T, props: ModalProps[T]) => {
      setModalState({ type, props });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModalState({ type: null, props: null });
  }, []);

  const isOpen = useCallback(
    (type: ModalType) => modalState.type === type,
    [modalState.type],
  );

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}

      {match(modalState.type)
        .with(ModalId.UserName, () => {
          const props = modalState.props as ModalProps[ModalId.UserName];
          return (
            <UserNameModal
              open={true}
              setOpen={(open) => !open && closeModal()}
              mode={props.mode}
              onSubmit={props.onSubmit}
              canDismiss={props.canDismiss}
            />
          );
        })
        .with(ModalId.CreateProject, () => {
          const props = modalState.props as ModalProps[ModalId.CreateProject];
          return (
            <CreateProjectModal
              open={true}
              setOpen={(open) => !open && closeModal()}
              onSuccess={props.onSuccess}
            />
          );
        })
        .with(null, () => null)
        .exhaustive()}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
