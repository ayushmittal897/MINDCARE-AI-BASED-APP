import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const demo = [
  { day: "Mon", risk: 0.22 },
  { day: "Tue", risk: 0.28 },
  { day: "Wed", risk: 0.31 },
  { day: "Thu", risk: 0.26 },
  { day: "Fri", risk: 0.35 },
  { day: "Sat", risk: 0.29 },
  { day: "Sun", risk: 0.24 },
];

export function RiskTimeline() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Longitudinal risk (demo)</CardTitle>
      </CardHeader>
      <CardContent className="h-56 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={demo} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip />
            <Line type="monotone" dataKey="risk" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
