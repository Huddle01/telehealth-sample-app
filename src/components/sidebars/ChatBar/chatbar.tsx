import { BasicIcons } from "@/utils/BasicIcons";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import ChatsPreview from "./chatsPreview";
import { useDataMessage, useLocalPeer } from "@huddle01/react/hooks";
import { useState } from "react";
import { PeerMetadata } from "@/utils/types";

const ChatBar = () => {
  const { sendData } = useDataMessage();
  const [message, setMessage] = useState("");
  const { metadata } = useLocalPeer<PeerMetadata>();

  const sendMessage = () => {
    sendData({
      to: "*",
      payload: JSON.stringify({
        message,
        name: metadata?.displayName,
      }),
      label: "chat",
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex w-80 rounded-lg mr-4 flex-col h-full bg-gray-800 text-white">
      <div className="px-4 py-2 border-b border-gray-700">
        <h1 className="text-xl font-semibold">Chat</h1>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <ChatsPreview />
      </div>
      <div className="p-2 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            className="flex-1 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            placeholder="Type your message"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            onKeyDown={handleKeyDown}
          />
          <Button
            className="bg-gray-700 hover:bg-gray-600 text-gray-200"
            onClick={sendMessage}
          >
            {BasicIcons.send}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
