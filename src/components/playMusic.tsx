import { useState } from "react";
import { Button } from "./ui/button";
import { BasicIcons } from "@/utils/BasicIcons";
import { useDataMessage } from "@huddle01/react/hooks";

interface PlayMusicProps {
  fileName: string;
  name: string;
}

const PlayMusic = ({ fileName, name }: PlayMusicProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audio = new Audio(fileName);
  const { sendData } = useDataMessage();
  return (
    <Button
      className="bg-gray-700 text-gray-200 hover:bg-gray-600"
      onClick={() => {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          sendData({ to: "*", payload: fileName, label: "playMusic" });
          setIsPlaying(true);
          audio.play();
        }
        audio.onended = () => {
          setIsPlaying(false);
        };
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{isPlaying ? BasicIcons.stop : BasicIcons.play}</span>
        <span>{name}</span>
      </div>
    </Button>
  );
};

export default PlayMusic;
