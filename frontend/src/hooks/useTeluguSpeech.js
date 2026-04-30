import { useState, useRef, useCallback } from 'react';

/**
 * Bhashini Telugu Speech Recognition Hook
 * Works on all browsers (Chrome, Firefox, Safari, Edge)
 */
export function useTeluguSpeech() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine mimeType for multi-browser support
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach(t => t.stop());
        await transcribeWithBhashini(audioBlob, mimeType);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error(err);
      setError('Microphone access denied or error starting recording');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const transcribeWithBhashini = async (audioBlob, mimeType) => {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Step 1: Get pipeline config from Bhashini
      const pipelineRes = await fetch(
        'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            userID: import.meta.env.VITE_BHASHINI_USER_ID || process.env.NEXT_PUBLIC_BHASHINI_USER_ID,
            ulcaApiKey: import.meta.env.VITE_BHASHINI_API_KEY || process.env.NEXT_PUBLIC_BHASHINI_API_KEY,
          },
          body: JSON.stringify({
            pipelineTasks: [{ taskType: 'asr', config: { language: { sourceLanguage: 'te' } } }],
            pipelineRequestConfig: { pipelineId: 'ai4bharat/conformer-multilingual-hi-gpu--t4' },
          }),
        }
      );

      const pipelineData = await pipelineRes.json();
      if (!pipelineData.pipelineInferenceAPIEndPoint) {
        throw new Error('Invalid Bhashini Response');
      }

      const { inferenceApiKey, callbackUrl } = pipelineData.pipelineInferenceAPIEndPoint;
      const serviceId = pipelineData.pipelineResponseConfig[0].config[0].serviceId;

      // Step 2: Send audio for transcription
      const inferRes = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: inferenceApiKey.value,
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'asr',
              config: {
                serviceId,
                language: { sourceLanguage: 'te' },
                audioFormat: mimeType.split('/')[1] || 'webm',
                samplingRate: 16000,
              },
            },
          ],
          inputData: { audio: [{ audioContent: base64Audio }] },
        }),
      });

      const inferData = await inferRes.json();
      const text = inferData.pipelineResponse[0].output[0].source;
      setTranscript(text);
    } catch (err) {
      setError('Transcription failed. Check API keys.');
      console.error(err);
    }
  };

  return { transcript, isListening, error, startListening, stopListening };
}
