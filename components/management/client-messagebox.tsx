import React from 'react';
import MessageBox from '../common/MessageBox';

interface ClientMessageBoxProps {
  conversationId: string;
  adminName?: string;
  className?: string;
  onBack?: () => void;
}

const ClientMessageBox: React.FC<ClientMessageBoxProps> = ({
  conversationId,
  adminName = 'Admin',
  className = '',
  onBack,
}) => {
  return (
    <MessageBox
      userType="client"
      title={adminName}
      conversationId={conversationId}
      onBack={onBack}
      className={className}
    />
  );
};

export default ClientMessageBox;