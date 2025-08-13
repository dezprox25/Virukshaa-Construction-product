import { JSX, useEffect, useRef, useState } from 'react';

interface MessagingPanelProps {
  conversationId: string;
  sender: 'admin' | 'client'; // or just string if dynamic
}

interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: string;
}

export default function MessagingPanel({
  conversationId,
  sender,
}: MessagingPanelProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages/${conversationId}`);
    const data = await res.json();
    setMessages(data.messages);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, sender, text }),
    });
    setText('');
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-4 border w-full max-w-md mx-auto flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg._id} className={`my-2 text-sm ${msg.sender === sender ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg ${msg.sender === sender ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="border rounded w-full p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
