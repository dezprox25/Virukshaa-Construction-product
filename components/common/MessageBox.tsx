"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Send, User, ArrowLeft } from "lucide-react"

export interface Message {
  id: string
  text: string
  sender: "client" | "superadmin"
  timestamp: Date
  read?: boolean
}

interface MessageBoxProps {
  userType: "client" | "admin"
  title: string
  onBack?: () => void
  className?: string
}

const MessageBox: React.FC<MessageBoxProps> = ({ userType, title, onBack, className = "" }) => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentSender = userType === "admin" ? "superadmin" : "client"

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const load = async () => {
      try {
        setIsLoading(true)
        const seedParam = userType === "client" ? "&seed=1" : ""
        const res = await fetch(`/api/messages?${seedParam}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("Failed to load messages")
        const data = await res.json()
        const msgs: Message[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          text: m.text,
          sender: m.sender === "superadmin" ? "superadmin" : "client",
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
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [userType])

  // Silent background polling to refresh messages without UI flicker
  useEffect(() => {
    let isMounted = true
    const interval = setInterval(async () => {
      try {
        const seedParam = userType === "client" ? "&seed=1" : ""
        const res = await fetch(`/api/messages?${seedParam}`, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const incoming: Message[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          text: m.text,
          sender: m.sender === "superadmin" ? "superadmin" : "client",
          timestamp: new Date(m.timestamp),
          read: !!m.read,
        }))
        if (!isMounted) return
        // Merge by id to preserve any optimistic entries and avoid flicker
        setMessages((prev) => {
          const map = new Map<string, Message>()
          for (const m of prev) map.set(m.id, m)
          for (const m of incoming) map.set(m.id, m)
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
        })
      } catch (_) {
        // ignore polling errors silently
      }
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [userType])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending) return

    const optimistic: Message = {
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
                sender: saved.sender === "superadmin" ? "superadmin" : "client",
                timestamp: new Date(saved.timestamp),
                read: !!saved.read,
              }
            : m,
        ),
      )

      // Refresh to get latest messages
      try {
        const refresh = await fetch(`/api/messages`, { cache: "no-store" })
        if (refresh.ok) {
          const payload = await refresh.json()
          const synced: Message[] = (payload.messages || []).map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: m.sender === "superadmin" ? "superadmin" : "client",
            timestamp: new Date(m.timestamp),
            read: !!m.read,
          }))
          setMessages(synced)
        }
      } catch (_) {
        // ignore refresh error
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid date"
      return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (error) {
      console.error("Error formatting time:", error)
      return "--:--"
    }
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return ""
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj)
    } catch (error) {
      console.error("Error formatting date:", error)
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

      {/* Chat background with pattern */}
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
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === (userType === "admin" ? "superadmin" : "client") ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg shadow ${
                    msg.sender === (userType === "admin" ? "superadmin" : "client")
                      ? "bg-[#dcf8c6] text-black rounded-tr-none"
                      : "bg-white text-black rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  {msg.sender === (userType === "admin" ? "superadmin" : "client") ? (
                    <div className="text-[10px] text-gray-500 mt-1 flex justify-end items-center gap-1">
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.read && <span className="text-blue-500">✓✓</span>}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500 mt-1 flex justify-start items-center gap-1">
                      <span>{formatDate(msg.timestamp)}</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#f0f2f5] p-3 border-t border-gray-300">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="flex-1 mx-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              disabled={isSending}
              className="w-full rounded-full border-0 bg-white px-4 py-2 focus-visible:ring-1 focus-visible:ring-gray-300 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="p-2 text-white bg-[#00a884] rounded-full hover:bg-[#128c7e] disabled:opacity-50"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageBox
