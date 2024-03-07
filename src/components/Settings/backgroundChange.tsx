import { BasicIcons } from "@/utils/BasicIcons";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import clsx from "clsx";
import { useStudioState } from "@/store/studioState";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useDataMessage, useLocalPeer, useRoom } from "@huddle01/react/hooks";
import { PeerMetadata, roomDetails } from "@/utils/types";
import toast from "react-hot-toast";
import { roomDB } from "@/utils/redis";
import { useEffect, useState } from "react";
import { Role } from "@huddle01/server-sdk/auth";

const BackgroundChange = () => {
  const { activeBg, setActiveBg } = useStudioState();
  const { sendData } = useDataMessage();
  const { role } = useLocalPeer<PeerMetadata>();
  const { room } = useRoom();
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleBgChange = async (bg: string) => {
    if (role === Role.HOST || role === Role.CO_HOST) {
      setActiveBg(bg);
      sendData({
        to: "*",
        payload: bg,
        label: "bgChange",
      });
      const getData = (await roomDB.get(room.roomId as string)) as roomDetails;
      await roomDB.set(room.roomId as string, {
        ...getData,
        activeBackground: bg,
      });
    } else {
      toast.error("Only the host can change the background");
    }
  };

  const getBackground = async () => {
    const roomData = (await roomDB.get(room.roomId as string)) as roomDetails;
    setBackgroundImages(roomData?.backgrounds || []);
  };

  useEffect(() => {
    getBackground();
  }, []);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      setIsUploading(true);
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        fetch(`/upload?fileName=${file.name}`, {
          method: "POST",
          body: formData,
        }).then(async (res) => {
          const getData = (await roomDB.get(
            room.roomId as string
          )) as roomDetails;
          const backgrounds = getData?.backgrounds || [];
          const bgUrl = await res.text();
          backgrounds.push(bgUrl);
          await roomDB.set(room.roomId as string, {
            ...getData,
            backgrounds: backgrounds,
          });
          setIsUploading(false);
          getBackground();
        });
      }
    };
    input.click();
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Background</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-4">
          <button
            className="bg-gray-800 flex justify-center items-center text-gray-200 text-center rounded-lg hover:bg-gray-700 text-sm"
            onClick={handleImageUpload}
          >
            {isUploading ? BasicIcons.spin : BasicIcons.image}
          </button>
          {backgroundImages.map((bg) => {
            return (
              <button
                key={bg}
                className={clsx(
                  "bg-gray-800 text-gray-200 p-2 rounded-lg hover:bg-gray-700",
                  activeBg === bg && "ring-2 ring-offset-2 ring-gray-400"
                )}
                onClick={() => handleBgChange(bg)}
              >
                <Avatar>
                  <AvatarImage src={bg} />
                </Avatar>
              </button>
            );
          })}
          {[...Array(5)].map((_, i) => {
            return (
              <button
                key={i}
                className={clsx(
                  "bg-gray-800 text-gray-200 p-2 rounded-lg hover:bg-gray-700",
                  activeBg === `/bg/${i + 1}.jpeg` &&
                    "ring-2 ring-offset-2 ring-gray-400"
                )}
                onClick={() => handleBgChange(`/bg/${i + 1}.jpeg`)}
              >
                <Avatar>
                  <AvatarImage src={`/bg/${i + 1}.jpeg`} />
                </Avatar>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BackgroundChange;
