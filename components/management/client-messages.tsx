import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreVertical, Paperclip, Send, Smile, Mic } from "lucide-react"

type Message = {
  id: number
  sender: string
  avatar: string
  message: string
  time: string
  unread: boolean
}

type Conversation = {
  id: number
  name: string
  role: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
}

export default function ClientMessages() {
  const conversations: Conversation[] = [
    {
      id: 1,
      name: "Project Team",
      role: "Team",
      avatar: "/avatars/team-1.jpg",
      lastMessage: "Let's discuss the design changes for the living room...",
      time: "2h",
      unread: 3
    },
    {
      id: 2,
      name: "John Smith",
      role: "Project Manager",
      avatar: "/avatars/team-2.jpg",
      lastMessage: "The materials have been ordered and will arrive...",
      time: "1d",
      unread: 0
    },
    {
      id: 3,
      name: "Sarah Johnson",
      role: "Interior Designer",
      avatar: "/avatars/team-3.jpg",
      lastMessage: "I've updated the 3D renderings for the kitchen...",
      time: "2d",
      unread: 1
    },
    {
      id: 4,
      name: "Michael Brown",
      role: "Contractor",
      avatar: "/avatars/team-4.jpg",
      lastMessage: "The foundation work is complete. We can now proceed...",
      time: "3d",
      unread: 0
    },
    {
      id: 5,
      name: "Emily Davis",
      role: "Architect",
      avatar: "/avatars/team-5.jpg",
      lastMessage: "Here are the revised blueprints with the changes we...",
      time: "1w",
      unread: 0
    }
  ]

  const messages: Message[] = [
    {
      id: 1,
      sender: "John Smith",
      avatar: "/avatars/team-2.jpg",
      message: "Hi there! How's the project going?",
      time: "10:30 AM",
      unread: false
    },
    {
      id: 2,
      sender: "You",
      avatar: "/avatars/user.jpg",
      message: "It's going well! We're making good progress.",
      time: "10:32 AM",
      unread: false
    },
    {
      id: 3,
      sender: "John Smith",
      avatar: "/avatars/team-2.jpg",
      message: "That's great to hear! Do you have any questions about the materials we discussed?",
      time: "10:33 AM",
      unread: true
    }
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${conversation.id === 1 ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{conversation.name}</p>
                        <span className="text-xs text-gray-500">• {conversation.role}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{conversation.lastMessage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{conversation.time}</p>
                    {conversation.unread > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs mt-1">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/avatars/team-1.jpg" />
                <AvatarFallback>PT</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">Project Team</h3>
                <p className="text-sm text-gray-500">5 members • Active now</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${msg.sender === 'You' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {msg.sender !== 'You' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div 
                        className={`rounded-lg p-3 ${msg.sender === 'You' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border'}`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className={`text-xs mt-1 ${msg.sender === 'You' ? 'text-right' : 'text-left'} text-gray-500`}>
                        {msg.time} {msg.unread && <span className="text-blue-500">• Unread</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message input */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input 
                  placeholder="Type a message..." 
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
