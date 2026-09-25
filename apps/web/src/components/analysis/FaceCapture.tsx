import { Camera, CameraOff, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFaceCapture } from "@/hooks/useFaceCapture";

interface Props {
  frameBase64: string | null;
  onFrameChange: (jpegBase64: string | null) => void;
}

export function FaceCapture({ frameBase64, onFrameChange }: Props) {
  const { videoRef, active, error, start, stop } = useFaceCapture();

  function captureFrame() {
    const v = videoRef.current;
    if (!v || v.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Flip horizontally to match the mirrored preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    ctx.drawImage(v, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    const b64 = dataUrl.split(",")[1];
    if (b64) onFrameChange(b64);
  }

  const frameKb = frameBase64 ? Math.round((frameBase64.length * 3) / 4 / 1024) : 0;

  return (
    <Card className="border-mind-iris/25">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Camera className="h-4 w-4 text-mind-iris" />
          Video window
          {active && <Badge className="bg-mind-iris/15 text-mind-iris">Preview live</Badge>}
          {frameBase64 && <Badge className="bg-primary/15 text-primary">Frame attached · ~{frameKb} KB</Badge>}
        </CardTitle>
        <CardDescription>
          Enable the camera, then capture one JPEG frame for FEAM. Without a frame, visual confidence stays low (stub).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <video ref={videoRef} className="h-full w-full object-contain -scale-x-100" playsInline muted />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Camera off</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!active ? (
            <Button type="button" variant="secondary" onClick={start} className="gap-2">
              <Camera className="h-4 w-4" />
              Enable camera
            </Button>
          ) : (
            <>
              <Button type="button" variant="default" onClick={captureFrame} className="gap-2">
                <ImagePlus className="h-4 w-4" />
                Attach current frame
              </Button>
              <Button type="button" variant="outline" onClick={stop} className="gap-2">
                <CameraOff className="h-4 w-4" />
                Stop camera
              </Button>
            </>
          )}
          {frameBase64 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onFrameChange(null)}>
              Clear frame
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
