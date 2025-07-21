import React, { useState } from 'react';
import ClientList, { Client } from '../common/ClientList';
import MessageBox from '../common/MessageBox';

const MessagingPanel: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showMobileClientList, setShowMobileClientList] = useState(true);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowMobileClientList(false);
  };

  const handleBackToClientList = () => {
    setShowMobileClientList(true);
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Client List - Always visible on desktop, toggled on mobile */}
      <div className={`${showMobileClientList ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-r border-gray-200`}>
        <ClientList 
          onClientSelect={handleClientSelect} 
          className="flex-1"
        />
      </div>

      {/* Message Box - Hidden on mobile when client list is shown */}
      {selectedClient ? (
        <div className={`${!showMobileClientList ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
          <MessageBox
            userType="admin"
            title={selectedClient.name}
            conversationId={`admin-${selectedClient._id}`}
            onBack={handleBackToClientList}
            className="flex-1"
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
              <svg
                className="h-full w-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">Select a client to start messaging</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a client from the list to view your conversation</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPanel;
