import { useDataMessage, useLocalAudio } from '@huddle01/react/hooks';
import { useEffect, useRef, useState } from 'react';

interface Props {
  audioStream: MediaStream | null;
  name: string | undefined;
  localPeerId: string | null;
}

const ShowCaptions = ({ audioStream, name, localPeerId }: Props) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [remoteCaptions, setRemoteCaptions] = useState('');
  const [remoteSpeaker, setRemoteSpeaker] = useState('');
  const { sendData } = useDataMessage({
    onMessage(payload, from, label) {
      if (from !== localPeerId && label === 'captions') {
        const { message, name } = JSON.parse(payload);
        setRemoteCaptions(message);
        setRemoteSpeaker(name);
      }
    },
  });

  const sendCaptions = async (captions: string) => {
    await sendData({
      to: '*',
      payload: JSON.stringify({
        name: name,
        message: captions,
      }),
      label: 'captions',
    });
  };

  useEffect(() => {
    console.log('audioStream', audioStream);
    if (!audioStream) return;

    wsRef.current = new WebSocket(`
        wss://api.rev.ai/speechtotext/v1/stream?access_token=${process.env.NEXT_PUBLIC_REVAI_ACCESS_TOKEN}&content_type=audio/webm;layout=interleaved;rate=16000;format=S16LE;channels=1&skip_postprocessing=true&priority=speed`);

    const mediaRecorder = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm',
    });

    wsRef.current.onopen = () => {
      console.log('Socket connection opened');

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const buffer = await e.data.arrayBuffer();
          wsRef.current?.send(buffer);
        }
      };
    };

    wsRef.current.onmessage = async (event) => {
      console.log('Socket message received!', event.data);

      const data = JSON.parse(event.data);
      console.log({ type: data.type, elements: data.elements });

      if (data.type === 'partial') {
        let text = '';
        data.elements.forEach((textObj: any) => {
          text = text + ' ' + textObj.value;
        });
        console.log('Partial text:', text);
        await sendCaptions(text);
      }
    };

    mediaRecorder.start();

    setInterval(() => {
      if (mediaRecorder?.state === 'recording') {
        mediaRecorder.requestData();
      }
    }, 500);
  }, [audioStream]);

  return (
    <>
      {remoteCaptions.length > 0 && (
        <div>
          <div className='text-white text-2xl text-center'>
            {remoteSpeaker}: {remoteCaptions}
          </div>
        </div>
      )}
    </>
  );
};

export default ShowCaptions;
