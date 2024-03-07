"use server";

import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import { Recorder } from "@huddle01/server-sdk/recorder";

interface LiveStreamProps {
  roomId: string;
  rtmpUrl: string;
}

const StartLiveStream = async ({ roomId, rtmpUrl }: LiveStreamProps) => {
  const recorder = new Recorder(
    process.env.NEXT_PUBLIC_PROJECT_ID!,
    process.env.API_KEY!
  );

  const accessToken = new AccessToken({
    apiKey: process.env.API_KEY!,
    roomId: roomId as string,
    role: Role.BOT,
    permissions: {
      admin: false,
      canConsume: true,
      canProduce: false,
      canProduceSources: {
        cam: false,
        mic: false,
        screen: false,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
  });

  const token = await accessToken.toJwt();
  const liveStream = await recorder.startLivestream({
    roomId: roomId,
    token,
    rtmpUrls: [rtmpUrl],
    customLayoutUrl: `https://studio-01.vercel.app/rec/${roomId}?token=${token}`,
  });

  return liveStream;
};

export default StartLiveStream;
