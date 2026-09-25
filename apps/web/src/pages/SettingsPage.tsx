import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogout, useRequestClinicianAccess } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteSessions = useMutation({
    mutationFn: async () => {
      await api.delete("/sessions");
    },
    onSuccess: () => {
      alert("All sessions and metadata have been successfully deleted.");
    },
    onError: (err) => {
      alert("Failed to delete data. Please try again.");
      console.error("Deletion error:", err);
    }
  });

  const requestClinician = useRequestClinicianAccess();

  const handleRequestClinician = () => {
    requestClinician.mutate(
      {},
      {
        onSuccess: (data) => {
          toast.success(data.message || "Request submitted successfully.");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to submit request.");
        }
      }
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Privacy controls and account actions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => logout.mutate()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data deletion</CardTitle>
          <CardDescription>Remove all my session data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            type="button" 
            variant="destructive" 
            disabled={deleteSessions.isPending}
            onClick={() => setShowDeleteModal(true)}
          >
            {deleteSessions.isPending ? "Deleting..." : "Delete my data"}
          </Button>
        </CardContent>
      </Card>

      {(user?.role === "patient" || user?.role === "pending_clinician") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clinician Access</CardTitle>
            <CardDescription>
              {user.role === "pending_clinician" 
                ? "Your request for clinician access is currently under review by an administrator."
                : "Request access to clinical features and patient management tools."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              type="button" 
              variant={user.role === "pending_clinician" ? "secondary" : "default"}
              disabled={user.role === "pending_clinician" || requestClinician.isPending}
              onClick={handleRequestClinician}
            >
              {requestClinician.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user.role === "pending_clinician" ? "Pending Approval" : "Request Clinician Access"}
            </Button>
          </CardContent>
        </Card>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 bg-card rounded-lg border border-border shadow-lg animate-in zoom-in-95 fade-in">
            <h3 className="text-lg font-semibold mb-2">Delete all data?</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              This action cannot be undone. This will permanently delete your account's session metadata, embeddings, and clinical screening history from our servers.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteSessions.isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                deleteSessions.mutate();
                setShowDeleteModal(false);
              }} disabled={deleteSessions.isPending}>
                Yes, delete data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
