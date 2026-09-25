import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getFeatureFlags, updateFeatureFlag, getDoctorRequests, processDoctorRequest, grantAdmin, FeatureFlag, DoctorRequest, getAdmins, revokeAdmin, AdminUser } from "@/api/admin";
import { useAuthStore } from "@/store/authStore";

export function AdminDashboard() {
  const currentUser = useAuthStore((s) => s.user);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  
  // State for rejection note modal/inline
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // State for Grant Admin
  const [grantEmail, setGrantEmail] = useState("");
  const [isGrantingAdmin, setIsGrantingAdmin] = useState(false);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadFlags();
    loadRequests();
    loadAdmins();
  }, []);

  const loadFlags = async () => {
    try {
      setLoadingFlags(true);
      const data = await getFeatureFlags();
      setFlags(data);
    } catch (e) {
      toast.error("Failed to load feature flags");
    } finally {
      setLoadingFlags(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await getDoctorRequests();
      setRequests(data);
    } catch (e) {
      toast.error("Failed to load doctor requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (e) {
      toast.error("Failed to load admins");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleToggleFlag = async (flagKey: string, currentEnabled: boolean) => {
    try {
      // Optimistic update
      setFlags(flags.map(f => f.flagKey === flagKey ? { ...f, enabled: !currentEnabled } : f));
      await updateFeatureFlag(flagKey, !currentEnabled);
      toast.success(`Flag ${flagKey} updated`);
    } catch (e) {
      toast.error(`Failed to update ${flagKey}`);
      // Revert on error
      setFlags(flags.map(f => f.flagKey === flagKey ? { ...f, enabled: currentEnabled } : f));
    }
  };

  const formatFlagName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(' Enabled', '');
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await processDoctorRequest(id, 'approve');
      toast.success("Doctor approved successfully");
      setRequests(requests.filter(r => r.id !== id));
    } catch (e) {
      toast.error("Failed to approve doctor");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (rejectingId !== id) {
      setRejectingId(id);
      setRejectNote("");
      return;
    }
    
    try {
      setProcessingId(id);
      await processDoctorRequest(id, 'reject', rejectNote);
      toast.success("Doctor rejected");
      setRequests(requests.filter(r => r.id !== id));
      setRejectingId(null);
    } catch (e) {
      toast.error("Failed to reject doctor");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGrantAdmin = async () => {
    if (!grantEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    try {
      setIsGrantingAdmin(true);
      const res = await grantAdmin(grantEmail.trim());
      toast.success(res.message);
      setGrantEmail("");
      loadAdmins(); // Refresh list after success
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to grant admin access");
    } finally {
      setIsGrantingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (email: string) => {
    if (currentUser?.email.toLowerCase() === email.toLowerCase()) {
      toast.error("You cannot revoke your own admin access.");
      return;
    }
    
    try {
      setRevokingEmail(email);
      const res = await revokeAdmin(email);
      toast.success(res.message);
      setAdmins(admins.filter(a => a.email.toLowerCase() !== email.toLowerCase()));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to revoke admin access");
    } finally {
      setRevokingEmail(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Manage system configurations and user approvals.</p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="requests">Pending Approvals</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="mt-6 space-y-4">
          {loadingRequests ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground">No pending doctor approvals.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {request.fullName}
                      <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    </CardTitle>
                    <CardDescription>{request.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-3 rounded-md mb-4 text-sm">
                      <span className="font-semibold block mb-1">Credentials / License:</span>
                      {request.credentialsInfo}
                    </div>
                    
                    {rejectingId === request.id ? (
                      <div className="space-y-3 p-4 bg-destructive/10 rounded-md border border-destructive/20">
                        <label className="text-sm font-medium text-destructive">Reason for Rejection (Optional)</label>
                        <Input 
                          placeholder="e.g. Invalid license number" 
                          value={rejectNote} 
                          onChange={(e) => setRejectNote(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)} disabled={processingId === request.id}>Cancel</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleReject(request.id)} disabled={processingId === request.id}>
                            {processingId === request.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleReject(request.id)} disabled={processingId === request.id}>
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button onClick={() => handleApprove(request.id)} disabled={processingId === request.id}>
                          {processingId === request.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="flags" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Feature Flags</CardTitle>
              <CardDescription>Toggle features on or off in real-time across the application.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFlags ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="divide-y border rounded-md">
                  {flags.filter(f => f.flagKey === 'session_tab').map((flag) => (
                    <div key={flag.flagKey} className="flex items-center justify-between p-4">
                      <div className="space-y-1">
                        <h4 className="font-medium text-lg">TOGGLE SESSION ON OR OFF</h4>
                        <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-1 py-0.5 rounded w-fit">{flag.flagKey}</p>
                        {flag.description && <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>}
                        <p className="text-[10px] text-muted-foreground/60 uppercase mt-2">
                          Last updated: {new Date(flag.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <Switch 
                        checked={!!flag.enabled} 
                        onCheckedChange={() => handleToggleFlag(flag.flagKey, !!flag.enabled)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grant Admin Access</CardTitle>
              <CardDescription>Elevate an existing user to administrator privileges.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <Input 
                  placeholder="user@example.com" 
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGrantAdmin()}
                  type="email"
                />
                <Button onClick={handleGrantAdmin} disabled={isGrantingAdmin}>
                  {isGrantingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Make Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Admins</CardTitle>
              <CardDescription>Users with active administrator privileges.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAdmins ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : admins.length === 0 ? (
                <p className="text-muted-foreground text-sm">No administrators found.</p>
              ) : (
                <div className="divide-y border rounded-md">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{admin.name || "Unknown Name"}</h4>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                        {admin.adminGrantedAt && (
                          <p className="text-[10px] text-muted-foreground/60">
                            Granted: {new Date(admin.adminGrantedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      {currentUser?.email.toLowerCase() !== admin.email.toLowerCase() && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRevokeAdmin(admin.email)}
                          disabled={revokingEmail === admin.email}
                        >
                          {revokingEmail === admin.email ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Revoke
                        </Button>
                      )}
                      
                      {currentUser?.email.toLowerCase() === admin.email.toLowerCase() && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
