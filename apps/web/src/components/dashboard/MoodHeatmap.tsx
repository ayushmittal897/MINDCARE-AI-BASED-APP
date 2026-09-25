import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const weeks = 4;
const days = ["M", "T", "W", "T", "F", "S", "S"];

function intensity(seed: number) {
  const v = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  if (v < 0.33) return 0;
  if (v < 0.66) return 1;
  return 2;
}

export function MoodHeatmap() {
  let k = 0;
  const cells = Array.from({ length: weeks * 7 }, () => intensity(k++));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mood heatmap (placeholder)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex gap-1 text-[10px] text-muted-foreground">
          {days.map((d) => (
            <span key={d} className="w-6 text-center">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-flow-col grid-rows-4 gap-1" style={{ gridTemplateColumns: `repeat(7, minmax(0, 1fr))` }}>
          {cells.map((level, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-sm",
                level === 0 && "bg-muted",
                level === 1 && "bg-primary/40",
                level === 2 && "bg-primary",
              )}
              title={`Day ${i + 1}`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Less activity</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span>More activity</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          * This graph visualizes your screening activity over the past month. Darker squares indicate days where you logged more sessions or reported higher emotional intensity.
        </p>
      </CardContent>
    </Card>
  );
}
