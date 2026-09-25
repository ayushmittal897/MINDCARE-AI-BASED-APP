import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function PendingApprovalPage() {
  const logout = useAuthStore(s => s.clear);

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="max-w-md w-full shadow-soft text-center">
        <CardHeader>
          <div className="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary">
            <Clock className="w-8 h-8" />
          </div>
          <CardTitle className="font-display text-2xl">Account Pending Approval</CardTitle>
          <CardDescription className="text-base mt-2">
            Your clinician account is currently under review by our administration team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm">
            We will notify you via email as soon as your account has been approved and your credentials have been verified.
          </p>
          <Button variant="outline" className="w-full" onClick={logout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
