import { Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin, useRegister, useVerifyEmail, useForgotPassword, useResetPassword, useLoginWithGoogle, useResendOtp } from "@/hooks/useAuth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export function LoginForm() {
  const [email, setEmail] = useState("demo@mindcare.local");
  const [password, setPassword] = useState("demo-demo");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "pending_clinician">("patient");
  const [credentialsInfo, setCredentialsInfo] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [view, setView] = useState<"tabs" | "verify" | "forgot" | "reset">("tabs");

  const login = useLogin();
  const register = useRegister();
  const verify = useVerifyEmail();
  const resendOtp = useResendOtp();
  const forgot = useForgotPassword();
  const reset = useResetPassword();
  const loginGoogle = useLoginWithGoogle();

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, {
      onError: (err: any) => {
        if (err?.response?.data?.requiresEmailVerification) {
          setView("verify");
        }
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ email, password, name, role, credentialsInfo }, {
      onSuccess: (data: any) => {
        if (data?.requiresEmailVerification) {
          setView("verify");
        }
      }
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verify.mutate({ email, otp });
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    resendOtp.mutate({ email }, {
      onSuccess: () => {
        setResendCooldown(30);
      }
    });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    forgot.mutate({ email }, {
      onSuccess: () => {
        setView("reset");
      }
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    reset.mutate({ email, otp, newPassword }, {
      onSuccess: () => {
        setView("tabs");
        setPassword(newPassword);
      }
    });
  };

  const errorMessage = (err: any) => {
    if (!err) return null;
    return err?.response?.data?.message || err.message;
  };

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  if (view === "verify") {
    return (
      <Card className="mx-auto w-full max-w-md shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView("tabs")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-display text-xl">Verify Email</CardTitle>
          </div>
          <CardDescription>
            We sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="space-y-2">
              <label htmlFor="verify-otp" className="text-sm font-medium">Verification Code</label>
              <Input id="verify-otp" type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" className="text-center tracking-widest text-lg" />
            </div>
            {verify.isError && <p className="text-sm text-destructive">{errorMessage(verify.error)}</p>}
            {resendOtp.isError && <p className="text-sm text-destructive">{errorMessage(resendOtp.error)}</p>}
            <Button type="submit" className="w-full" disabled={verify.isPending}>
              {verify.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Verify Account
            </Button>
            <Button type="button" variant="outline" className="w-full mt-2" disabled={resendCooldown > 0 || resendOtp.isPending} onClick={handleResend}>
              {resendOtp.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (view === "forgot") {
    return (
      <Card className="mx-auto w-full max-w-md shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView("tabs")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-display text-xl">Reset Password</CardTitle>
          </div>
          <CardDescription>Enter your email to receive a password reset code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleForgot}>
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="text-sm font-medium">Email</label>
              <Input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {forgot.isError && <p className="text-sm text-destructive">{errorMessage(forgot.error)}</p>}
            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              {forgot.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send Reset Code
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (view === "reset") {
    return (
      <Card className="mx-auto w-full max-w-md shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView("forgot")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-display text-xl">Set New Password</CardTitle>
          </div>
          <CardDescription>Enter the code sent to {email} and your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleReset}>
            <div className="space-y-2">
              <label htmlFor="reset-otp" className="text-sm font-medium">Reset Code</label>
              <Input id="reset-otp" type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" className="text-center tracking-widest text-lg" />
            </div>
            <div className="space-y-2">
              <label htmlFor="reset-password" className="text-sm font-medium">New Password</label>
              <Input id="reset-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            {reset.isError && <p className="text-sm text-destructive">{errorMessage(reset.error)}</p>}
            <Button type="submit" className="w-full" disabled={reset.isPending}>
              {reset.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Card className="mx-auto w-full max-w-md shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl">Welcome to MindCare</CardTitle>
          <CardDescription>Sign in to your account or register a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          
          {GOOGLE_CLIENT_ID && (
            <div className="mb-6 flex flex-col items-center justify-center">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  if (credentialResponse.credential) {
                    loginGoogle.mutate({ token: credentialResponse.credential });
                  }
                }}
                onError={() => {
                  console.error('Login Failed');
                }}
                useOneTap
              />
              {loginGoogle.isError && <p className="mt-2 text-sm text-destructive">{errorMessage(loginGoogle.error)}</p>}
              <div className="mt-4 flex w-full items-center gap-2">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs text-muted-foreground uppercase">Or continue with email</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                  <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                    <Button type="button" variant="ghost" className="px-0 h-auto font-normal text-primary hover:bg-transparent hover:underline" onClick={() => setView("forgot")}>
                      Forgot password?
                    </Button>
                  </div>
                  <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {login.isError && <p className="text-sm text-destructive">{errorMessage(login.error)}</p>}
                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              {register.isSuccess && !register.data?.requiresEmailVerification && !register.data?.accessToken ? (
                <div className="space-y-4 text-center py-6">
                  <div className="bg-primary/10 text-primary p-4 rounded-lg font-medium">
                    Registration successful. Please wait for an administrator to approve your account before logging in.
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <label htmlFor="register-name" className="text-sm font-medium">Full Name (Optional)</label>
                    <Input id="register-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="register-email" className="text-sm font-medium">Email</label>
                    <Input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="text-sm font-medium">Password</label>
                    <Input id="register-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Type</label>
                    <div className="flex gap-4 items-center h-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="role" value="patient" checked={role === "patient"} onChange={() => setRole("patient")} className="accent-primary w-4 h-4 cursor-pointer" />
                        <span className="text-sm">Patient (Personal Use)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="role" value="pending_clinician" checked={role === "pending_clinician"} onChange={() => setRole("pending_clinician")} className="accent-primary w-4 h-4 cursor-pointer" />
                        <span className="text-sm">I'm a Doctor/Clinician</span>
                      </label>
                    </div>
                  </div>
                  {role === "pending_clinician" && (
                    <div className="space-y-2">
                      <label htmlFor="register-credentials" className="text-sm font-medium">Credentials / License Number</label>
                      <Input id="register-credentials" type="text" name="credentialsInfo" value={credentialsInfo} onChange={(e) => setCredentialsInfo(e.target.value)} required placeholder="e.g. MD, License #12345" />
                    </div>
                  )}
                  {register.isError && <p className="text-sm text-destructive">{errorMessage(register.error)}</p>}
                  <Button type="submit" className="w-full" disabled={register.isPending}>
                    {register.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Account
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </GoogleOAuthProvider>
  );
}
