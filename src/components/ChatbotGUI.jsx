import { useState } from "react"
import { Paperclip } from "lucide-react"
import { sendMessageToAI } from "../api/chatbot"

const ChatbotGUI = () => {

  const [open,setOpen] = useState(false)
  const [input,setInput] = useState("")
  const [messages,setMessages] = useState([
    {sender:"bot", text:"Hello! I am your AI Legal Assistant."}
  ])

  const sendMessage = async () => {

    if(!input.trim()) return

    const userMessage = {sender:"user", text:input}

    setMessages(prev => [...prev, userMessage])

    const reply = await sendMessageToAI(input)

    const botMessage = {sender:"bot", text:reply}

    setMessages(prev => [...prev, botMessage])

    setInput("")
  }

  return (

    <div className="fixed bottom-6 right-6">

      {!open && (
        <button
        onClick={()=>setOpen(true)}
        className="bg-gray-600 text-white p-4 rounded-full shadow-lg hover:bg-gray-500">
          AI
        </button>
      )}

      {open && (

        <div className="w-80 h-96 bg-white text-black rounded-xl shadow-xl flex flex-col">

          <div className="bg-gray-900 text-white p-3 rounded-t-xl flex justify-between">

            AI Legal Assistant

            <button onClick={()=>setOpen(false)}>✕</button>

          </div>

          {/* MESSAGE AREA */}

          <div className="flex-1 overflow-y-auto p-3 space-y-2">

            {messages.map((msg,index)=>(

              <div
              key={index}
              className={`p-2 rounded-lg w-fit ${
                msg.sender === "user"
                ? "bg-gray-600 ml-auto"
                : "bg-gray-200"
              }`}
              >
                {msg.text}
              </div>

            ))}

          </div>

          {/* INPUT AREA */}

          <div className="flex p-2 border-t">

            <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            className="flex-1 border rounded-lg px-2"
            placeholder="Ask legal question..."
            />

            <Paperclip className="ml-2 cursor-pointer"/>

            <button
            onClick={sendMessage}
            className="ml-2 bg-gray-600 px-3 rounded-lg hover:bg-gray-500"
            >
              Send
            </button>

          </div>

        </div>

      )}

    </div>

  )

}

export default ChatbotGUI

