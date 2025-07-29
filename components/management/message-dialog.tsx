import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MessageBox from "../common/MessageBox";

export interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
  onSend: (message: string, clientId: string) => void; // not used but kept for compatibility
}

export const MessageDialog: React.FC<MessageDialogProps> = ({ open, onOpenChange, client }) => {
  if (!client) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Chat with {client.name}</DialogTitle>
        <DialogDescription className="sr-only">Send and view messages with this client.</DialogDescription>
        <MessageBox
          userType="admin"
          title={client.name}
          conversationId={`client-${client._id}`}
          onBack={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
