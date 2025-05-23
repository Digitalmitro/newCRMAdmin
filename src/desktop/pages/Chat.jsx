import { useEffect, useState, useRef } from "react";
import axios from "axios";
import profile from "../../assets/desktop/profileIcon.svg";
import { Send,Paperclip } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  sendMessage,
  onMessageReceived,
  connectSocket,
  onUserStatusUpdate
} from "../../utils/socket";
import { useAuth } from "../../context/authContext";
import moment from "moment";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";

const Chat = () => {
  const location = useLocation();
  const user = location.state;
  const receiverId = user?.id;
  const selectedUser = location?.state?.selectedUsers;
 
  const { userData } = useAuth();
  const senderId = userData?.userId;
  const [isOnline, setIsOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null); // Auto-scroll reference
  const [file, setFile] = useState(null);
  // ✅ Load chat history
  useEffect(() => {
    console.log(location);
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_API
          }/message/messages/${senderId}/${receiverId}`
        );
        setMessages(res.data?.messages);
        // console.log(res.data?.messages)
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (senderId && receiverId) {
      fetchMessages();
    }

    connectSocket();

    onMessageReceived((newMessage) => {
      if (
        (newMessage.sender === senderId &&
          newMessage.receiver === receiverId) ||
        (newMessage.sender === receiverId && newMessage.receiver === senderId)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    onUserStatusUpdate(({ userId, status }) => {
      if (userId === receiverId) {
        setIsOnline(status === "online");
      }
    });

    return () => {
      console.log("🛑 Unsubscribing from message listener");
    };
  }, [senderId, receiverId]);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      message: input,
      createdAt: new Date(),
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/message/send-message`,
        newMessage
      );
      sendMessage(senderId, receiverId, input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ✅ Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);

    setTimeout(() => {
      document.getElementById("chatInput").focus();
    }, 0);
  };



  return (
    <div className="p-4 w-full flex flex-col h-[500px]">
      <div className="flex gap-4 mb-6 border-b pt-2 px-8 pb-2">
        <p className=" rounded-full border items-center  flex justify-center w-10 h-10 text-xl  text-white bg-orange-500">
          {user?.name?.charAt(0) || selectedUser?.[0]?.name?.charAt(0)}
        </p>
        <div>
          <h2 className="text-sm font-semibold">{user?.name}</h2>
          <p className="text-[10px] text-green-500 font-semibold">{isOnline ? "🟢 Online" : "🔴 Offline"}</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto scrollable mb-10">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 max-w-xs rounded-lg mb-2 flex justify-between 
            ${
              msg.sender === senderId
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white ml-auto"
                : "bg-gradient-to-l from-gray-500 to-gray-700 text-white"
            }
            `}
            style={{
              width: `${
                msg.message.length <= 5
                  ? 90
                  : Math.min((msg.message?.length ?? 0) * 15, 300)
              }px`,
            }}
          >
            <span className="break-all">{msg.message}</span>
            <span className="text-[9px] flex flex-col justify-end">
              {moment(msg.createdAt).format("HH:mm")}
            </span>
          </div>
        ))} 
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white flex items-center border-t fixed bottom-0 w-[65%] space-x-2">
        <div className="relative">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <BsEmojiSmile size={22} className="cursor-pointer text-gray-500" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-10 left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <Paperclip size={22} className="text-gray-500" />
        </label>

        <input
          id="chatInput"
          type="text"
          className="flex-1 p-2 border rounded-lg outline-none text-[15px] w-full"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />

        <button
          onClick={handleSendMessage}
          className="ml-2 p-2 bg-orange-400 text-white rounded-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
