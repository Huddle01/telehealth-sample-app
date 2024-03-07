import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import StartLiveStream from "./startLiveStream";
import { useRoom } from "@huddle01/react/hooks";
import { useStudioState } from "@/store/studioState";

const LiveStreaming = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const { isLiveStreaming, setIsLiveStreaming } = useStudioState();
  const { room } = useRoom();

  return (
    <Card className="w-96 max-w-2xl">
      <CardHeader>Live Stream</CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Stream URL"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
          />
          <Input
            placeholder="Stream Key"
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
          />
          <Button
            onClick={async () => {
              if (isLiveStreaming) {
                const stopLiveStreaming = await fetch(
                  `/rec/stopRecording?roomId=${room.roomId}`
                );
                const res = await stopLiveStreaming.json();
                if (res) {
                  setIsLiveStreaming(false);
                }
              } else {
                if (!streamUrl || !streamKey) {
                  toast.error("Please enter stream url and key");
                }
                const url = `${streamUrl}/${streamKey}`;
                const res = await StartLiveStream({
                  roomId: room.roomId as string,
                  rtmpUrl: url,
                });
                if (res) {
                  setIsLiveStreaming(true);
                }
              }
            }}
          >
            {isLiveStreaming ? "Stop" : "Start"} Streaming
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveStreaming;
