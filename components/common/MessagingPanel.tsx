"use client"

import { useState } from "react"
import MessageBox from "./MessageBox"
import { MessageSquare, Users } from "lucide-react"

export default function MessagingPanel() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [clients] = useState([
    {
      id: "client-1",
      name: "John Doe",
      lastMessage: "Hello, I need help with my project",
      time: "2 min ago",
      unread: 2,
      avatar: "/diverse-user-avatars.png",
    },
    {
      id: "client-2",
      name: "Jane Smith",
      lastMessage: "Thank you for the update",
      time: "1 hour ago",
      unread: 0,
      avatar: "/diverse-female-avatar.png",
    },
    {
      id: "client-3",
      name: "Mike Johnson",
      lastMessage: "When will the work start?",
      time: "3 hours ago",
      unread: 1,
      avatar: "/male-avatar.png",
    },
    {
      id: "client-current-user",
      name: "Current User",
      lastMessage: "Test conversation",
      time: "5 min ago",
      unread: 0,
      avatar: "/professional-client-avatar.png",
    },
  ])

  if (selectedClient) {
    const client = clients.find((c) => c.id === selectedClient)
    return (
      <MessageBox
        userType="admin"
        title={client?.name || "Client"}
        conversationId={selectedClient}
        onBack={() => setSelectedClient(null)}
        className="h-full"
      />
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500">Manage client conversations</p>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client.id)}
            className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={client.avatar || "/placeholder.svg"}
                  alt={client.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {client.unread > 0 && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {client.unread}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">{client.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {clients.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Client messages will appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}
