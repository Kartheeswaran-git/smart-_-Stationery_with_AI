import React, { useState } from 'react';
import { X, Send, Paperclip, PenLine, Sparkles } from 'lucide-react';

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: '👋 Hi! Tell me how you want to customize your product!' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { from: 'user', text: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        setInput('');

        try {
            const response = await fetch("http://localhost:5002/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input.trim() })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to generate image");
            }

            const data = await response.json();

            const botReply = {
                from: 'bot',
                text: "Here is your customized product preview:",
                image: data.image
            };

            setMessages((prev) => [...prev, botReply]);

        } catch (err) {
            console.error("Backend Error:", err);
            setMessages((prev) => [...prev, {
                from: 'bot',
                text: `⚠️ Error: ${err.message}. Make sure the AI server is running.`
            }]);
        }

        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="w-16 h-16 rounded-2xl shadow-xl bg-amber-500 flex items-center justify-center"
                >
                    <PenLine size={28} className="text-white" />
                </button>
            )}

            {open && (
                <div className="w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col">

                    <header className="p-4 bg-amber-600 text-white flex justify-between">
                        <span>Smart Fancy AI</span>
                        <button onClick={() => setOpen(false)}>
                            <X />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                        {messages.map((msg, idx) => (
                            <div key={idx}
                                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-3 rounded-xl shadow ${msg.from === 'user'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100'
                                    }`}>

                                    <p>{msg.text}</p>

                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="Generated"
                                            className="mt-2 rounded-lg w-full"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="text-sm text-gray-400">
                                Generating image...
                            </div>
                        )}
                    </div>

                    <footer className="p-3 border-t flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your customized product..."
                            className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-amber-600 text-white px-4 rounded-lg"
                        >
                            <Send size={18} />
                        </button>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default Chatbot;


// import React, { useState } from "react";
// import { X, Send, PenLine } from "lucide-react";

// const Chatbot = () => {
//     const [open, setOpen] = useState(false);
//     const [messages, setMessages] = useState([
//         { from: "bot", text: "👋 Hi! Tell me how you want to customize your product!" },
//     ]);
//     const [input, setInput] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSend = async () => {
//         if (!input.trim()) return;

//         const userText = input.trim();

//         // Add user message
//         setMessages((prev) => [...prev, { from: "user", text: userText }]);
//         setInput("");
//         setLoading(true);

//         try {
//             const response = await fetch("http://localhost:5002/generate", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ prompt: userText }),
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText);
//             }

//             const data = await response.json();

//             // Add bot reply
//             setMessages((prev) => [
//                 ...prev,
//                 {
//                     from: "bot",
//                     text: data.improvedPrompt,
//                 },
//             ]);
//         } catch (err) {
//             console.error("Backend Error:", err);
//             setMessages((prev) => [
//                 ...prev,
//                 {
//                     from: "bot",
//                     text: "⚠️ Error connecting to AI server. Make sure backend is running.",
//                 },
//             ]);
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="fixed bottom-6 right-6 z-[9999]">
//             {!open && (
//                 <button
//                     onClick={() => setOpen(true)}
//                     className="w-16 h-16 rounded-2xl shadow-xl bg-amber-500 flex items-center justify-center"
//                 >
//                     <PenLine size={28} className="text-white" />
//                 </button>
//             )}

//             {open && (
//                 <div className="w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col">
//                     <header className="p-4 bg-amber-600 text-white flex justify-between">
//                         <span>Smart Fancy AI</span>
//                         <button onClick={() => setOpen(false)}>
//                             <X />
//                         </button>
//                     </header>

//                     <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                         {messages.map((msg, idx) => (
//                             <div
//                                 key={idx}
//                                 className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"
//                                     }`}
//                             >
//                                 <div
//                                     className={`max-w-[80%] p-3 rounded-xl shadow ${msg.from === "user"
//                                             ? "bg-amber-500 text-white"
//                                             : "bg-gray-100"
//                                         }`}
//                                 >
//                                     <p className="text-sm whitespace-pre-line">{msg.text}</p>
//                                 </div>
//                             </div>
//                         ))}

//                         {loading && (
//                             <div className="text-sm text-gray-400">
//                                 ✨ Improving your prompt...
//                             </div>
//                         )}
//                     </div>

//                     <footer className="p-3 border-t flex gap-2">
//                         <input
//                             type="text"
//                             value={input}
//                             onChange={(e) => setInput(e.target.value)}
//                             onKeyDown={(e) => e.key === "Enter" && handleSend()}
//                             placeholder="Describe your customized product..."
//                             className="flex-1 border rounded-lg px-3 py-2 text-sm"
//                         />
//                         <button
//                             onClick={handleSend}
//                             className="bg-amber-600 text-white px-4 rounded-lg"
//                         >
//                             <Send size={18} />
//                         </button>
//                     </footer>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Chatbot;