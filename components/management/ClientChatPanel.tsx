import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Message {
  senderEmail: string;
  receiverEmail: string;
  text: string;
}

export default function ClientChatPanel({ adminEmail }: { adminEmail: string }) {
  const { data: session, status } = useSession(); // track loading state
  const clientEmail = session?.user?.email || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!clientEmail) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${clientEmail}`, {
          credentials: "include", // ✅ send session cookies
        });
        if (!res.ok) {
          console.error("Error fetching messages:", await res.text());
          return;
        }
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Network or parsing error:", err);
      }
    };

    fetchMessages();
  }, [clientEmail, adminEmail]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !clientEmail) return;
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ send cookies
      body: JSON.stringify({
        senderEmail: clientEmail,
        receiverEmail: adminEmail,
        text: newMessage,
      }),
    });
    if (res.ok) {
      setMessages((prev) => [
        ...prev,
        { senderEmail: clientEmail, receiverEmail: adminEmail, text: newMessage },
      ]);
      setNewMessage("");
    }
  };

  // ✅ Handle states properly
  if (status === "loading") {
    return <p>Loading chat...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Please log in to use the chat.</p>;
  }

  return (
    <div className="border rounded p-4 w-full max-w-md">
      <div className="h-64 overflow-y-auto border-b mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.senderEmail === clientEmail ? "text-right" : "text-left"}
          >
            <span className="bg-gray-200 px-2 py-1 rounded">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
