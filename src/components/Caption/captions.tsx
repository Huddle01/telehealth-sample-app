'use client';

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from '@deepgram/sdk';
import { useState, useEffect, useCallback } from 'react';
import { useQueue } from '@uidotdev/usehooks';
import { useLocalAudio } from '@huddle01/react/hooks';

export default function Captions() {
  const { add, remove, first, size, queue } = useQueue<any>([]);
  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [caption, setCaption] = useState<string | null>();
  const { isAudioOn, stream: mediaStream } = useLocalAudio();

  const toggleMicrophone = useCallback(async () => {
    if (mediaStream) {
      const microphone = new MediaRecorder(mediaStream);
      microphone.start(500);

      microphone.onstart = () => {
        setMicOpen(true);
      };

      microphone.onstop = () => {
        setMicOpen(false);
      };

      microphone.ondataavailable = (e) => {
        add(e.data);
      };

      setUserMedia(mediaStream);
      setMicrophone(microphone);
    }
  }, [add, mediaStream]);

  useEffect(() => {
    if (isAudioOn) {
      toggleMicrophone();
    }
  }, [isAudioOn]);

  useEffect(() => {
    if (!apiKey) {
      console.log('getting a new api key');
      fetch('/api', { cache: 'no-store' })
        .then((res) => res.json())
        .then((object) => {
          if (!('key' in object)) throw new Error('No api key returned');

          setApiKey(object);
          setLoadingKey(false);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey && 'key' in apiKey) {
      console.log('connecting to deepgram');
      const deepgram = createClient(apiKey?.key ?? '');
      const connection = deepgram.listen.live({
        model: 'nova',
        interim_results: true,
        smart_format: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('connection established');
        setListening(true);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('connection closed');
        setListening(false);
        setApiKey(null);
        setConnection(null);
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const words = data.channel.alternatives[0].words;
        const caption = words
          .map((word: any) => word.punctuated_word ?? word.word)
          .join(' ');
        if (caption !== '') {
          setCaption(caption);
        }
      });

      setConnection(connection);
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = first;
          connection?.send(blob);
          remove();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [connection, queue, remove, first, size, isProcessing, isListening]);

  if (isLoadingKey)
    return (
      <span className='w-full text-center'>Loading temporary API key...</span>
    );
  if (isLoading)
    return <span className='w-full text-center'>Loading the app...</span>;

  return (
    <div className='w-full relative'>
      <div className='mt-4 flex flex-col align-middle items-center'>
        <div className='p-6 text-xl text-center'>
          {caption && micOpen ? caption : 'Listening...'}
        </div>
      </div>
    </div>
  );
}
