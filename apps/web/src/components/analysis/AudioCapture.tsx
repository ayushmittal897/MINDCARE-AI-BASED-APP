import { Mic, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { useEffect, useRef } from "react";

function AudioVisualizer({ stream }: { stream: MediaStream }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !stream) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = `rgb(13, 148, ${Math.min(255, 136 + barHeight)})`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={400} height={60} className="h-full w-full" />;
}

function fmtTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  clip: Blob | null;
  onClipChange: (blob: Blob | null) => void;
}

export function AudioCapture({ clip, onClipChange }: Props) {
  const { recording, elapsedSec, error, start, stopAndGetBlob, stream } = useAudioCapture();

  async function handleStop() {
    const blob = await stopAndGetBlob();
    onClipChange(blob);
  }

  const clipKb = clip ? Math.round(clip.size / 1024) : 0;

  return (
    <Card className="border-mind-teal/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-4 w-4 text-mind-teal" />
          Acoustic capture
          {recording && (
            <Badge className="animate-pulse border-destructive/50 bg-destructive text-destructive-foreground">
              Live · {fmtTime(elapsedSec)}
            </Badge>
          )}
          {clip && !recording && (
            <Badge className="bg-mind-teal/15 text-mind-teal">Clip ready · {clipKb} KB</Badge>
          )}
        </CardTitle>
        <CardDescription>
          "Speak something about how you experienced the last 3 days." Clear the clip if you want to run a text-only analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative h-[60px] w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center border border-border/50">
          {recording && stream ? (
            <AudioVisualizer stream={stream} />
          ) : (
            <div className="text-sm text-muted-foreground">Microphone off</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!recording ? (
            <Button type="button" variant="secondary" onClick={start} className="gap-2">
              <Mic className="h-4 w-4" />
              Start microphone
            </Button>
          ) : (
            <Button type="button" variant="destructive" onClick={handleStop} className="gap-2">
              <Square className="h-4 w-4" />
              Stop & attach clip
            </Button>
          )}
          {clip && !recording && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onClipChange(null)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove clip
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
