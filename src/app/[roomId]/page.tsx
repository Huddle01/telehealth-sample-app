'use client';

import RemotePeer from '@/components/remotePeer';
import { useStudioState } from '@/store/studioState';
import { BasicIcons } from '@/utils/BasicIcons';
import {
  useDataMessage,
  useDevices,
  useLocalAudio,
  useLocalMedia,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from '@huddle01/react/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BottomBar from '@/components/bottomBar';
import { Button } from '@/components/ui/button';
import { PeerMetadata } from '@/utils/types';
import ChatBar from '@/components/sidebars/ChatBar/chatbar';
import ParticipantsBar from '@/components/sidebars/participantsSidebar/participantsBar';
import Video from '@/components/Media/Video';
import { Role } from '@huddle01/server-sdk/auth';
import clsx from 'clsx';
import GridContainer from '@/components/GridContainer';
import ShowCaptions from '@/components/Caption/showCaptions';
import RemoteScreenShare from '@/components/remoteScreenShare';

export default function Component({ params }: { params: { roomId: string } }) {
  const { isVideoOn, enableVideo, disableVideo, stream } = useLocalVideo();
  const {
    isAudioOn,
    enableAudio,
    disableAudio,
    stream: audioStream,
  } = useLocalAudio();
  const { fetchStream } = useLocalMedia();
  const { setPreferredDevice: setCamPrefferedDevice } = useDevices({
    type: 'cam',
  });
  const { setPreferredDevice: setAudioPrefferedDevice } = useDevices({
    type: 'mic',
  });
  const {
    name,
    isChatOpen,
    isParticipantsOpen,
    addChatMessage,
    activeBg,
    videoDevice,
    audioInputDevice,
    layout,
    isRecordAudio,
  } = useStudioState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.GUEST],
  });
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { peerId } = useLocalPeer();
  const { metadata, role } = useLocalPeer<PeerMetadata>();
  const { videoTrack, audioTrack, shareStream } = useLocalScreenShare();
  const { state } = useRoom({
    onLeave: async () => {
      router.push(`/${params.roomId}/lobby`);
    },
  });

  useDataMessage({
    async onMessage(payload, from, label) {
      if (label === 'chat') {
        const { message, name } = JSON.parse(payload);
        addChatMessage({
          name: name,
          text: message,
          isUser: from === peerId,
        });
      }
      if (label === 'file') {
        const { message, fileName, name } = JSON.parse(payload);
        // fetch file from message and display it
        addChatMessage({
          name: name,
          text: message,
          isUser: from === peerId,
          fileName,
        });
      }
      if (label === 'server-message') {
        const { s3URL } = JSON.parse(payload);
        console.log('s3URL', s3URL);
      }
    },
  });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (state === 'idle') {
      router.push(`${params.roomId}/lobby`);
    }
  }, [state]);

  useEffect(() => {
    setCamPrefferedDevice(videoDevice.deviceId);
    if (isVideoOn) {
      disableVideo();
      const changeVideo = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: 'cam',
        });
        if (stream) {
          await enableVideo(stream);
        }
      };
      changeVideo();
    }
  }, [videoDevice]);

  useEffect(() => {
    setAudioPrefferedDevice(audioInputDevice.deviceId);
    if (isAudioOn) {
      disableAudio();
      const changeAudio = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: 'mic',
        });
        if (stream) {
          enableAudio(stream);
        }
      };
      changeAudio();
    }
  }, [audioInputDevice]);

  return (
    <div className={clsx('flex flex-col h-screen bg-black')}>
      <header className='flex items-center justify-between p-4'>
        <h1 className='text-white text-xl font-semibold'>Studio01</h1>
        <div className='flex space-x-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='flex gap-2 bg-gray-600/50 text-gray-200 hover:bg-gray-500/50'>
                {BasicIcons.invite}
                Invite
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className='flex space-x-2'>
                <span className='p-2 bg-gray-700/50 rounded-lg'>
                  http://{window.location.host}/{params.roomId}
                </span>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `http://${window.location.host}/${params.roomId}`
                    );
                    setIsCopied(true);
                    setTimeout(() => {
                      setIsCopied(false);
                    }, 3000);
                  }}
                >
                  {isCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main
        className={`transition-all ease-in-out flex items-center justify-center flex-1 duration-300 py-4 w-full h-full`}
        style={{
          backgroundColor: activeBg === 'bg-black' ? 'black' : undefined,
          backgroundImage:
            activeBg === 'bg-black' ? undefined : `url(${activeBg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className='flex w-full h-full p-2'>
          {shareStream && (
            <div className='w-3/4'>
              <GridContainer className='w-full h-full'>
                <>
                  <Video
                    stream={videoTrack && new MediaStream([videoTrack])}
                    name={metadata?.displayName ?? 'guest'}
                  />
                </>
              </GridContainer>
            </div>
          )}
          {peerIds.map((peerId) => (
            <RemoteScreenShare key={peerId} peerId={peerId} />
          ))}
          <section
            className={clsx(
              'justify-center gap-4 px-4',
              shareStream ? 'flex flex-col w-1/4' : 'flex flex-wrap w-full',
              layout === 1 ? 'h-full' : 'h-3/5'
            )}
          >
            {role !== Role.BOT && (
              <GridContainer
                className={clsx(shareStream ? 'w-full h-full my-3 mx-1' : '')}
              >
                {metadata?.isHandRaised && (
                  <span className='absolute top-4 right-4 text-4xl text-gray-200 font-medium'>
                    ✋
                  </span>
                )}
                {stream ? (
                  <>
                    <Video
                      stream={stream}
                      name={metadata?.displayName ?? 'guest'}
                    />
                  </>
                ) : (
                  <div className='flex text-3xl font-semibold items-center justify-center w-24 h-24 bg-gray-700 text-gray-200 rounded-full'>
                    {name[0]?.toUpperCase()}
                  </div>
                )}
                <span className='absolute bottom-4 left-4 text-gray-200 font-medium'>
                  {`${metadata?.displayName} (You)`}
                </span>
              </GridContainer>
            )}
            {peerIds.map((peerId) => (
              <RemotePeer key={peerId} peerId={peerId} />
            ))}
          </section>
        </div>
        {isChatOpen && <ChatBar />}
        {isParticipantsOpen && <ParticipantsBar />}
      </main>
      <ShowCaptions
        mediaStream={audioStream}
        name={metadata?.displayName}
        localPeerId={peerId}
      />
      <BottomBar />
    </div>
  );
}
