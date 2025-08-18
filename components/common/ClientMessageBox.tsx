// import React, { useEffect, useRef, useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Send, User, ArrowLeft } from 'lucide-react';

// export interface ClientMessage {
//   id: string;
//   text: string;
//   sender: 'client' | 'superadmin';
//   timestamp: Date;
//   conversationId?: string;
//   read?: boolean;
// }

// interface ClientMessageBoxProps {
//   title: string;
//   conversationId: string;
//   onBack?: () => void;
//   className?: string;
// }

// const ClientMessageBox: React.FC<ClientMessageBoxProps> = ({
//   title,
//   conversationId,
//   onBack,
//   className = '',
// }) => {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<ClientMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const initialLoadDoneRef = useRef<boolean>(false);

//   // For the client view, the current user is always the 'client'
//   const currentSender: 'client' = 'client';

//   // Initial load (non-blocking)
//   useEffect(() => {
//     // Do nothing until we have a valid conversation id
//     if (!conversationId) return;
//     let isMounted = true;
//     const controller = new AbortController();
//     initialLoadDoneRef.current = false;

//     const load = async () => {
//       try {
//         // Mark loading before fetching to ensure UI waits for DB
//         if (isMounted) setIsLoading(true);
//         const res = await fetch(
//           `/api/messages?conversationId=${encodeURIComponent(conversationId)}&seed=1`,
//           { cache: 'no-store', signal: controller.signal }
//         );
//         if (!res.ok) throw new Error('Failed to load messages');
//         const data = await res.json();
//         const msgs: ClientMessage[] = (data.messages || []).map((m: any) => ({
//           id: m.id,
//           text: m.text,
//           sender: m.sender,
//           conversationId: m.conversationId,
//           timestamp: new Date(m.timestamp),
//           read: !!m.read,
//         }));
//         if (isMounted) setMessages(msgs);
//       } catch (e: any) {
//         if (e?.name !== 'AbortError' && isMounted) {
//           setMessages([]);
//         }
//       } finally {
//         if (isMounted) {
//           initialLoadDoneRef.current = true;
//           setIsLoading(false);
//         }
//       }
//     };

//     load();
//     return () => {
//       isMounted = false;
//       controller.abort();
//     };
//   }, [conversationId]);

//   // Auto scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim() || !conversationId) return;

//     const optimistic: ClientMessage = {
//       id: 'temp-' + Date.now().toString(),
//       text: message,
//       sender: currentSender,
//       conversationId,
//       timestamp: new Date(),
//       read: true,
//     };

//     setMessages(prev => [...prev, optimistic]);
//     const textToSend = message;
//     setMessage('');

//     try {
//       setIsSending(true);
//       const res = await fetch('/api/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: textToSend, sender: currentSender, conversationId }),
//       });
//       if (!res.ok) throw new Error('Failed to send');
//       const data = await res.json();
//       const saved = data.data;
//       setMessages(prev => prev.map(m => m.id === optimistic.id ? {
//         id: saved.id,
//         text: saved.text,
//         sender: saved.sender,
//         conversationId: saved.conversationId,
//         timestamp: new Date(saved.timestamp),
//         read: !!saved.read,
//       } : m));

//       // Refetch to ensure DB-saved message list is reflected
//       const refresh = await fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`, { cache: 'no-store' });
//       if (refresh.ok) {
//         const payload = await refresh.json();
//         const synced: ClientMessage[] = (payload.messages || []).map((m: any) => ({
//           id: m.id,
//           text: m.text,
//           sender: m.sender,
//           conversationId: m.conversationId,
//           timestamp: new Date(m.timestamp),
//           read: !!m.read,
//         }));
//         setMessages(synced);
//       }
//     } catch (err) {
//       console.error('Send message failed', err);
//       setMessages(prev => prev.filter(m => m.id !== optimistic.id));
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const formatTime = (date: Date | string) => {
//     try {
//       const dateObj = typeof date === 'string' ? new Date(date) : date;
//       if (isNaN(dateObj.getTime())) return 'Invalid date';
//       return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } catch {
//       return '--:--';
//     }
//   };

//   const formatDate = (date: Date | string) => {
//     try {
//       const dateObj = typeof date === 'string' ? new Date(date) : date;
//       if (isNaN(dateObj.getTime())) return '';
//       return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateObj);
//     } catch {
//       return '';
//     }
//   };

//   return (
//     <div className={`flex flex-col h-screen bg-[#e5ddd5] max-h[700px] bg-opacity-30 ${className}`}>
//       {/* Header */}
//       <div className="bg-[#0c0c0c] p-3 flex items-center justify-between text-white">
//         <div className="flex items-center">
//           {onBack && (
//             <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-white/10">
//               <ArrowLeft className="h-5 w-5" />
//             </button>
//           )}
//           <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
//             <User className="h-5 w-5 text-gray-600" />
//           </div>
//           <div className="ml-3">
//             <h2 className="font-medium">{title}</h2>
//           </div>
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] bg-opacity-30">
//         {!conversationId ? (
//           <div className="flex items-center justify-center h-full text-gray-500">Preparing chat...</div>
//         ) : isLoading && messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-500">Loading messages...</div>
//         ) : messages.length === 0 ? (
//           <div className="flex items-center justify-center h-full text-gray-500">No messages yet. Start the conversation!</div>
//         ) : (
//           <div className="space-y-2">
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[80%] p-3 rounded-lg shadow ${msg.sender === 'client'
//                     ? 'bg-[#dcf8c6] text-black rounded-tr-none'
//                     : 'bg-white text-black rounded-tl-none'
//                   }`}
//                 >
//                   <p className="text-sm">{msg.text}</p>
//                   <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center space-x-1">
//                     <span>{formatTime(msg.timestamp)}</span>
//                     <span>{formatDate(msg.timestamp)}</span>
//                     {msg.read && <span className="text-blue-500">✓✓</span>}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>

//       {/* Input */}
//       <div className="bg-[#f0f2f5] p-3 border-top border-gray-300">
//         <form onSubmit={handleSendMessage} className="flex items-center">
//           <div className="flex-1 mx-2">
//             <Input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message"
//               disabled={!conversationId || isSending || !initialLoadDoneRef.current}
//               className="w-full rounded-full border-0 bg-white px-4 py-2 focus-visible:ring-1 focus-visible:ring-gray-300 disabled:opacity-50"
//             />
//           </div>
//           <button type="submit" disabled={!conversationId || isSending || !initialLoadDoneRef.current} className="p-2 text-white bg-[#00a884] rounded-full hover:bg-[#128c7e] disabled:opacity-50">
//             <Send className="h-6 w-6" />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ClientMessageBox;


"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Send, User, ArrowLeft } from "lucide-react"

export interface ClientMessage {
  id: string
  text: string
  sender: "client" | "superadmin"
  timestamp: Date
  read?: boolean
}

interface ClientMessageBoxProps {
  title: string
  onBack?: () => void
  className?: string
}

const ClientMessageBox: React.FC<ClientMessageBoxProps> = ({ title, onBack, className = "" }) => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialLoadDoneRef = useRef<boolean>(false)

  const currentSender = "client" as const

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    initialLoadDoneRef.current = false

    const load = async () => {
      try {
        if (isMounted) setIsLoading(true)
        const res = await fetch(`/api/messages?seed=1`, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("Failed to load messages")
        const data = await res.json()
        const msgs: ClientMessage[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          timestamp: new Date(m.timestamp),
          read: !!m.read,
        }))
        if (isMounted) setMessages(msgs)
      } catch (e: any) {
        if (e?.name !== "AbortError" && isMounted) {
          setMessages([])
        }
      } finally {
        if (isMounted) {
          initialLoadDoneRef.current = true
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const optimistic: ClientMessage = {
      id: "temp-" + Date.now().toString(),
      text: message,
      sender: currentSender,
      timestamp: new Date(),
      read: true,
    }

    setMessages((prev) => [...prev, optimistic])
    const textToSend = message
    setMessage("")

    try {
      setIsSending(true)
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend, sender: currentSender }),
      })
      if (!res.ok) throw new Error("Failed to send")
      const data = await res.json()
      const saved = data.data
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id
            ? {
                id: saved.id,
                text: saved.text,
                sender: saved.sender,
                timestamp: new Date(saved.timestamp),
                read: !!saved.read,
              }
            : m,
        ),
      )

      // Refetch to ensure all messages are shown
      const refresh = await fetch(`/api/messages`, { cache: "no-store" })
      if (refresh.ok) {
        const payload = await refresh.json()
        const synced: ClientMessage[] = (payload.messages || []).map((m: any) => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          timestamp: new Date(m.timestamp),
          read: !!m.read,
        }))
        setMessages(synced)
      }
    } catch (err) {
      console.error("Send message failed", err)
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid date"
      return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "--:--"
    }
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return ""
      return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).format(dateObj)
    } catch {
      return ""
    }
  }

  return (
    <div className={`flex flex-col h-screen bg-[#e5ddd5] max-h-[700px] bg-opacity-30 ${className}`}>
      {/* Header */}
      <div className="bg-[#0c0c0c] p-3 flex items-center justify-between text-white">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="ml-3">
            <h2 className="font-medium">{title}</h2>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] bg-opacity-30">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow ${
                    msg.sender === "client"
                      ? "bg-[#dcf8c6] text-black rounded-tr-none"
                      : "bg-white text-black rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center space-x-1">
                    <span>{formatTime(msg.timestamp)}</span>
                    <span>{formatDate(msg.timestamp)}</span>
                    {msg.read && <span className="text-blue-500">✓✓</span>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-[#f0f2f5] p-3 border-t border-gray-300">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="flex-1 mx-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              disabled={isSending || !initialLoadDoneRef.current}
              className="w-full rounded-full border-0 bg-white px-4 py-2 focus-visible:ring-1 focus-visible:ring-gray-300 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !initialLoadDoneRef.current}
            className="p-2 text-white bg-[#00a884] rounded-full hover:bg-[#128c7e] disabled:opacity-50"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ClientMessageBox
