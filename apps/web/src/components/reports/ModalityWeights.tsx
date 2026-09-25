import type { ModalityWeights as Weights } from "@mindcare/types";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useNavigate } from "react-router-dom";

interface Props {
  weights: Weights | null;
}

export function ModalityWeights({ weights }: Props) {
  const navigate = useNavigate();

  if (!weights) {
    return (
      <EmptyState
        icon={
          <div className="rounded-full bg-primary/10 p-4">
            <SlidersHorizontal className="h-8 w-8 text-primary opacity-80" />
          </div>
        }
        title="CAFE Weights"
        description="The context-aware fusion engine will display its dynamic modality weighting here after analysis."
        actionLabel="Take Assessment"
        onAction={() => navigate("/screening")}
      />
    );
  }

  const rows = [
    { label: "Acoustic (wA)", value: weights.wA, color: "bg-mind-teal" },
    { label: "Visual (wV)", value: weights.wV, color: "bg-mind-iris" },
    { label: "Linguistic (wL)", value: weights.wL, color: "bg-mind-coral" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Modality weights [wA, wV, wL]</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{r.label}</span>
              <span className="font-mono">{(r.value * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${r.color}`} style={{ width: `${Math.min(100, r.value * 100)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
