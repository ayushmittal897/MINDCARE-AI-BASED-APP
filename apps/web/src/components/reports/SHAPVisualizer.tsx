import type { SHAPFeatureContribution } from "@mindcare/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const FEATURE_MAP: Record<string, { label: string; desc: string }> = {
  "VADER positive sentiment": { label: "Positive Words", desc: "The amount of positive and uplifting language you used." },
  "VADER compound (valence)": { label: "Overall Sentiment", desc: "The overall emotional tone (positive or negative) of your words." },
  "Linguistic 6-way peak: Healthy": { label: "Healthy Speech Patterns", desc: "Language patterns commonly associated with a healthy mental state." },
  "Linguistic 6-way peak: MildDep": { label: "Mild Low Mood Patterns", desc: "Language patterns that suggest a mild dip in mood." },
  "Linguistic 6-way peak: ModDep": { label: "Moderate Low Mood Patterns", desc: "Language patterns that suggest feeling down or unmotivated." },
  "Linguistic 6-way peak: SevDep": { label: "Severe Low Mood Patterns", desc: "Language patterns strongly associated with low mood or depression." },
  "Linguistic 6-way peak: MildAnx": { label: "Mild Stress Patterns", desc: "Language patterns that suggest mild worry or stress." },
  "Linguistic 6-way peak: ModAnx": { label: "Moderate Stress Patterns", desc: "Language patterns that suggest elevated anxiety or stress." },
  "Byte-stream activity (audio proxy)": { label: "Vocal Activity", desc: "How much you spoke and the energy in your voice." },
  "Frame sharpness / gradient (visual proxy)": { label: "Facial Expressions", desc: "Changes and movements in your facial expressions." },
  "VADER negative sentiment": { label: "Negative Words", desc: "The amount of negative or distressing language you used." },
  "Depression-lexicon density": { label: "Low-Mood Keywords", desc: "The frequency of words often related to feeling down." },
  "Anxiety-lexicon density": { label: "Stress Keywords", desc: "The frequency of words often related to feeling anxious." },
};

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md max-w-xs">
        <p className="font-semibold">{data.userLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">{data.desc}</p>
        <p className="mt-2 text-sm font-medium">
          Impact Score: <span className="text-primary">{Number(data.value).toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
}

interface Props {
  rankings: SHAPFeatureContribution[];
}

export function SHAPVisualizer({ rankings }: Props) {
  const data = [...rankings]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 8)
    .map((r) => {
      const mapping = FEATURE_MAP[r.feature] || { label: r.feature, desc: "A contributing factor in the analysis." };
      return {
        name: r.feature,
        userLabel: mapping.label,
        desc: mapping.desc,
        value: r.value,
        modality: r.modality,
      };
    });

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">SHAP-style contributions</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-4">
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Run analysis to populate feature attributions.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, left: 8, right: 16, bottom: 20 }}>
              <XAxis 
                type="number" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                label={{ value: 'Feature Impact Score (Importance)', position: 'insideBottom', offset: -15, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
              />
              <YAxis type="category" dataKey="userLabel" width={110} tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
