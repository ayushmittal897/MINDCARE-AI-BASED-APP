import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { title: "Consent", body: "You control recordings. Raw media stays on-device in the full architecture; this demo sends minimal payloads to the API." },
  { title: "Privacy", body: "Review how embeddings and summaries are stored. Request deletion at any time from Settings." },
  { title: "Permissions", body: "We need microphone and camera for multimodal capture. You can skip hardware and use text-only in development." },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: Props) {
  const [i, setI] = useState(0);
  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">{step.title}</CardTitle>
        <CardDescription>
          Step {i + 1} of {steps.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        <div className="flex justify-between gap-2">
          <Button type="button" variant="ghost" disabled={i === 0} onClick={() => setI((x) => Math.max(0, x - 1))}>
            Back
          </Button>
          {last ? (
            <Button type="button" className="gap-2" onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4" />
              Done
            </Button>
          ) : (
            <Button type="button" onClick={() => setI((x) => x + 1)}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
