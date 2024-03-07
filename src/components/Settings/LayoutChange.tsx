import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import clsx from "clsx";
import { useStudioState } from "@/store/studioState";
import { useDataMessage, useRoom } from "@huddle01/react/hooks";
import { roomDB } from "@/utils/redis";
import { roomDetails } from "@/utils/types";

const LayoutChange = () => {
  const { layout, setLayout } = useStudioState();
  const { sendData } = useDataMessage();
  const { room } = useRoom();

  const handleLayoutChange = async (layout: 1 | 2) => {
    setLayout(layout);
    const roomData = (await roomDB.get(room.roomId as string)) as roomDetails;
    await roomDB.set(room.roomId as string, {
      ...roomData,
      layout,
    });
    sendData({
      payload: JSON.stringify({ layout }),
      to: "*",
      label: "layout",
    });
  };

  return (
    <Card className="w-96 max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Image
            src="/layout/1.png"
            className={clsx(
              "rounded-lg cursor-pointer",
              layout === 1 && "ring-2 ring-gray-600 bg-gray-800"
            )}
            alt="layout-1"
            width={150}
            height={150}
            onClick={() => handleLayoutChange(1)}
          />
          <Image
            src="/layout/2.png"
            className={clsx(
              "rounded-lg cursor-pointer",
              layout === 2 && "ring-2 ring-gray-600 bg-gray-800"
            )}
            alt="layout-2"
            width={150}
            height={150}
            onClick={() => handleLayoutChange(2)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutChange;
