import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioCapture() {
  const [recording, setRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!recording) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    setElapsedSec(0);
    tickRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [recording]);

  const start = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(s);
      const mr = new MediaRecorder(s, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.start(250);
      setRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone access denied");
    }
  }, []);

  /** Stop recorder once and return the audio Blob (WebM/Opus in most browsers). */
  const stopAndGetBlob = useCallback(async (): Promise<Blob | null> => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") {
      setRecording(false);
      setStream(null);
      return null;
    }
    return new Promise((resolve) => {
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        mr.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setRecording(false);
        setStream(null);
        resolve(blob.size ? blob : null);
      };
      try {
        mr.requestData?.();
      } catch {
        /* optional */
      }
      mr.stop();
    });
  }, []);

  return { recording, elapsedSec, error, start, stopAndGetBlob, stream };
}
