import { Activity, Mic, Type, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ModalityStatusProps {
  transcriptChars: number;
  hasAudio: boolean;
  audioKb?: number;
  hasVideoFrame: boolean;
}

function Row({
  ok,
  icon: Icon,
  label,
  description,
  detail,
}: {
  ok: boolean;
  icon: typeof Mic;
  label: string;
  description: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-card/50 px-3 py-2.5">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", ok ? "text-primary" : "text-muted-foreground")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{label}</span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wider", ok ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
            {ok ? "Included" : "Not provided"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/80 mt-0.5 mb-1">{description}</p>
        <p className="text-[13px] text-foreground font-medium">{detail}</p>
      </div>
    </div>
  );
}

export function ModalityStatus({ transcriptChars, hasAudio, audioKb, hasVideoFrame }: ModalityStatusProps) {
  const hasText = transcriptChars > 0;
  const allQuiet = !hasText && !hasAudio && !hasVideoFrame;

  return (
    <Card className="border-dashed border-primary/30 bg-accent/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Multimodal payload (next run)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {allQuiet && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Nothing to send yet — add text, record audio, and/or attach a video frame so CAFE has real inputs.
          </p>
        )}
        <Row
          ok={hasText}
          icon={Type}
          label="LAM · Linguistic"
          description="Language Analysis Model processes semantics & sentiment."
          detail={hasText ? `${transcriptChars} characters in transcript` : "Empty transcript (LAM confidence will be low)"}
        />
        <Row
          ok={hasAudio}
          icon={Mic}
          label="AAM · Acoustic"
          description="Acoustic Analysis Model analyzes vocal tone & rhythm."
          detail={hasAudio ? `Audio clip attached (~${audioKb ?? "?"} KB)` : "Add audio for a more complete analysis"}
        />
        <Row
          ok={hasVideoFrame}
          icon={Video}
          label="FEAM · Visual"
          description="Facial Expression Analysis maps micro-expressions."
          detail={hasVideoFrame ? "JPEG frame attached" : "Add a photo for a more complete analysis"}
        />
      </CardContent>
    </Card>
  );
}
