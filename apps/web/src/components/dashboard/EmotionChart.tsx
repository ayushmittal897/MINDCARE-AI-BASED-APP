import type { AnalysisResult } from "@mindcare/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  result: AnalysisResult | null;
}

export function EmotionChart({ result }: Props) {
  const data =
    result?.probabilities.map((p) => ({
      label: p.label.replace(/([A-Z])/g, " $1").trim(),
      value: Math.round(p.probability * 100),
    })) ?? [];

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Emotional Insight Radar</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-4">
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Complete a session to visualize scores.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
