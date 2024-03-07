import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Recording, roomDetails } from "@/utils/types";
import { useEffectOnce } from "usehooks-ts";
import { roomDB } from "@/utils/redis";
import Link from "next/link";

interface RecordingsModalProps {
  children: React.ReactNode;
  roomId: string;
  type: "full" | "audio" | "video";
}

const RecordingsModal: FC<RecordingsModalProps> = ({
  children,
  roomId,
  type,
}) => {
  const [roomData, setRoomData] = useState<roomDetails>();

  useEffectOnce(() => {
    const getRoomData = async () => {
      const roomData = (await roomDB.get(roomId)) as roomDetails;
      console.log(roomData);
      setRoomData(roomData);
    };
    getRoomData();
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}{" "}
            Recordings
          </DialogTitle>
        </DialogHeader>
        {type === "full" && (
          <div className="flex flex-col gap-4">
            {roomData?.recordings ? (
              roomData.recordings.map((recording, index) => {
                return (
                  <Link
                    href={recording}
                    key={index}
                    className="p-2 bg-gray-800 rounded-lg"
                  >
                    Recording - {index + 1}
                  </Link>
                );
              })
            ) : (
              <div className="p-2 bg-gray-800 rounded-lg">
                No Recordings Found
              </div>
            )}
          </div>
        )}
        {type === "audio" && (
          <div className="flex flex-col gap-4">
            {roomData?.audioRecordings ? (
              roomData.audioRecordings.map((recording: Recording, index) => {
                return (
                  <Link
                    key={index}
                    href={Object.values(recording)[index]}
                    className="p-2 bg-gray-800 rounded-lg"
                  >
                    {Object.keys(recording)[index]}&apos;s Audio Recording
                  </Link>
                );
              })
            ) : (
              <div className="p-2 bg-gray-800 rounded-lg">
                No Recordings Found
              </div>
            )}
          </div>
        )}
        {type === "video" && (
          <div className="flex flex-col gap-4">
            {roomData?.videoRecordings ? (
              roomData.videoRecordings.map((recording: Recording, index) => {
                return (
                  <Link
                    key={index}
                    href={Object.values(recording)[index]}
                    className="p-2 bg-gray-800 rounded-lg"
                  >
                    {Object.keys(recording)[index]}&apos;s Video Recording
                  </Link>
                );
              })
            ) : (
              <div className="p-2 bg-gray-800 rounded-lg">
                No Recordings Found
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecordingsModal;
