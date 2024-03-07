"use client";

import RemotePeer from "@/components/remotePeer";
import { useStudioState } from "@/store/studioState";
import {
  useDataMessage,
  useLocalPeer,
  usePeerIds,
  useRoom,
} from "@huddle01/react/hooks";
import { useEffect } from "react";
import { PeerMetadata, roomDetails } from "@/utils/types";
import { Role } from "@huddle01/server-sdk/auth";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { roomDB } from "@/utils/redis";

export default function Component({ params }: { params: { roomId: string } }) {
  const { activeBg, setActiveBg, layout, setLayout } = useStudioState();
  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.CO_HOST, Role.SPEAKER],
  });
  const { peerId } = useLocalPeer<PeerMetadata>();
  const searchParams = useSearchParams();
  const { joinRoom } = useRoom();

  useDataMessage({
    onMessage(payload, from, label) {
      if (label === "playMusic" && from !== peerId) {
        const audio = new Audio(payload);
        audio.play();
      }
      if (label === "bgChange" && from !== peerId) {
        setActiveBg(payload);
      }
      if (label === "layout") {
        const { layout } = JSON.parse(payload);
        if (layout) {
          setLayout(layout);
        }
      }
    },
  });

  useEffect(() => {
    const setBackground = async () => {
      const roomData = (await roomDB.get(params.roomId)) as roomDetails;
      if (roomData.activeBackground) {
        setActiveBg(roomData.activeBackground);
      }
      setLayout(roomData?.layout || 1);
    };
    setBackground();
    if (params.roomId && searchParams.get("token")) {
      joinRoom({
        roomId: params.roomId,
        token: searchParams.get("token") as string,
      });
    } else {
      console.log("no token");
    }
  }, []);

  return (
    <div className={clsx("flex flex-col h-screen bg-black")}>
      <main
        className={`transition-all ease-in-out flex items-center justify-center flex-1 duration-300 py-4 w-full h-full`}
        style={{
          backgroundColor: activeBg === "bg-black" ? "black" : undefined,
          backgroundImage:
            activeBg === "bg-black" ? undefined : `url(${activeBg})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <section
          className={clsx(
            "flex flex-wrap justify-center w-full gap-4 px-4",
            layout === 1 ? "h-full" : "h-3/5"
          )}
        >
          {peerIds.map((peerId) => (
            <RemotePeer key={peerId} peerId={peerId} />
          ))}
        </section>
      </main>
    </div>
  );
}
