import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function TextInput({ value, onChange }: Props) {
  return (
    <Card className="border-primary/20 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-lg font-semibold text-primary">Transcript / free text</CardTitle>
        <CardDescription>
          Type something about your experiences over the last 3 days. Your text will be analyzed to understand your emotional state.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Textarea
          className="min-h-[120px] text-base resize-y focus-visible:ring-primary/50"
          placeholder="How have you been feeling this week? You can type as much as you want here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
