import { IChatMessage, useStudioState } from "@/store/studioState";

const ChatsPreview = () => {
  const { chatMessages } = useStudioState();
  return (
    <>
      {chatMessages.map((chat: IChatMessage) => {
        return (
          <div
            key={chat.name}
            className={`${
              chat.isUser
                ? "ml-auto text-md break-words max-w-xs w-fit py-1 px-2 mb-2 bg-[#216CFC] rounded-lg items-center flex"
                : "w-fit py-1 px-2 break-words max-w-xs text-md mb-2 rounded-lg bg-[#343744]"
            }`}
          >
            <div className="text-xs text-blue-300">
              {chat.isUser ? null : chat.name}
            </div>
            {chat.text}
          </div>
        );
      })}
    </>
  );
};

export default ChatsPreview;
