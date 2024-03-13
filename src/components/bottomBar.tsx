'use client';
import {
  useDataMessage,
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from '@huddle01/react/hooks';
import { Button } from '@/components/ui/button';
import { BasicIcons } from '@/utils/BasicIcons';
import { useStudioState } from '@/store/studioState';
import ButtonWithIcon from './ui/buttonWithIcon';
import ChangeDevice from './changeDevice';
import { Role } from '@huddle01/server-sdk/auth';
import { useState } from 'react';
import { PeerMetadata } from '@/utils/types';
import clsx from 'clsx';
import { startRecording, stopRecording } from './Recorder/Recording';

const BottomBar = () => {
  const { isAudioOn, enableAudio, disableAudio } = useLocalAudio();
  const { isVideoOn, enableVideo, disableVideo } = useLocalVideo();
  const { sendData } = useDataMessage();
  const { leaveRoom, room } = useRoom();
  const { role, metadata, updateMetadata } = useLocalPeer<PeerMetadata>();
  const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST] });
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();

  const {
    isChatOpen,
    setIsChatOpen,
    isParticipantsOpen,
    setIsParticipantsOpen,
    isRecording,
    setIsRecording,
    isUploading,
  } = useStudioState();

  const handleRecording = async () => {
    if (isRecording) {
      await stopRecording(room.roomId as string);
      setIsRecording(false);
    } else {
      await startRecording(room.roomId as string);
      setIsRecording(true);
    }
  };

  return (
    <footer className='flex items-center justify-between p-4'>
      <div className='flex items-center'>
        {role === Role.HOST ? (
          <Button
            className='flex gap-2 bg-red-500 hover:bg-red-400 text-white text-md font-semibold'
            onClick={handleRecording}
          >
            {isUploading ? BasicIcons.spin : BasicIcons.record}{' '}
            {isRecording ? (isUploading ? 'Starting...' : 'Stop Capturing') : 'Summarize'}
          </Button>
        ) : (
          <div className='w-24' />
        )}
      </div>

      {/* Middle Section */}
      <div className={clsx('flex space-x-3', role === Role.HOST ? 'mr-4' : '')}>
        <ChangeDevice deviceType='cam'>
          <button
            onClick={() => {
              if (isVideoOn) {
                disableVideo();
              } else {
                enableVideo();
              }
            }}
            className='bg-gray-600/50 p-2.5 rounded-lg'
          >
            {isVideoOn ? BasicIcons.on.cam : BasicIcons.off.cam}
          </button>
        </ChangeDevice>
        <ChangeDevice deviceType='mic'>
          <button
            onClick={() => {
              if (isAudioOn) {
                disableAudio();
              } else {
                enableAudio();
              }
            }}
            className='bg-gray-600/50 p-2.5 rounded-lg'
          >
            {isAudioOn ? BasicIcons.on.mic : BasicIcons.off.mic}
          </button>
        </ChangeDevice>
        <ChangeDevice deviceType='speaker'>
          <button
            onClick={() => {}}
            className='bg-gray-600/50 p-2.5 rounded-lg'
          >
            {BasicIcons.speaker}
          </button>
        </ChangeDevice>
        <ButtonWithIcon
          onClick={() => {
            if (shareStream !== null) {
              stopScreenShare();
            } else {
              startScreenShare();
            }
          }}
          className={clsx(shareStream !== null && 'bg-gray-500')}
        >
          {BasicIcons.screenShare}
        </ButtonWithIcon>
        <ButtonWithIcon
          onClick={() => {
            updateMetadata({
              displayName: metadata?.displayName || '',
              isHandRaised: !metadata?.isHandRaised,
            });
          }}
          className={clsx(metadata?.isHandRaised && 'bg-gray-500')}
        >
          {BasicIcons.handRaise}
        </ButtonWithIcon>
        <ButtonWithIcon onClick={leaveRoom}>{BasicIcons.end}</ButtonWithIcon>
      </div>

      <div className='flex space-x-3'>
        <ButtonWithIcon
          onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
        >
          {BasicIcons.people}
        </ButtonWithIcon>
        <ButtonWithIcon onClick={() => setIsChatOpen(!isChatOpen)}>
          {BasicIcons.chat}
        </ButtonWithIcon>
      </div>
    </footer>
  );
};

export default BottomBar;
