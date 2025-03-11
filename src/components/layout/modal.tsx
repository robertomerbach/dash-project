"use client"

import { ReactNode, memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface ModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  content: ReactNode;
  footer?: ReactNode;
}

const ModalComponent = memo(function Modal({
  title,
  description,
  isOpen,
  onClose,
  content,
  footer,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
          {content}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
});

export { ModalComponent as Modal };