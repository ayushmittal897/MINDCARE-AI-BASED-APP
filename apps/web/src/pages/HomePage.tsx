import { ArrowRight, LogOut, Sparkles, Mic, Camera, MessageSquare, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const logout = useLogout();
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Multimodal mental wellness insights
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Calm, clinical clarity from voice, face, and language.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground mb-6">
            MindCare combines AAM, FEAM, LAM, CAFE, and ERM in one auditable stack—designed for consent-first capture and explainable
            outputs.
          </p>
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-3 border border-yellow-200 dark:border-yellow-800 max-w-xl mb-2">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium m-0">
              <strong>MEDICAL DISCLAIMER:</strong> This app is a screening/demonstration tool, is NOT a medical diagnosis, and is NOT a substitute for consultation with a licensed mental health professional.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {token ? (
              <>
                <Link to="/analysis">
                  <Button type="button" className="gap-2">
                    Start session
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button type="button" variant="outline" className="gap-2" onClick={() => logout.mutate()} disabled={logout.isPending}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button type="button" variant="secondary" className="text-blue-600" onClick={() => setShowOnboarding(true)}>
                Review onboarding
              </Button>
            )}
          </div>
          {user && (
            <p className="mt-4 text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
          )}
        </div>
        <div className="space-y-4">
          {showOnboarding && !token ? (
            <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
          ) : !token ? (
            <LoginForm />
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-700">
              <h2 className="text-lg font-semibold font-display mb-4 text-foreground/80">How MindCare Works</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-card/40 backdrop-blur-md border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-inner">
                        <Mic className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold font-display text-sm tracking-wide">AAM</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground/80 font-medium">Acoustic Analysis Model</strong> analyzes vocal tone, pitch variations, and speech rhythm for emotional markers.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-inner">
                        <Camera className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold font-display text-sm tracking-wide">FEAM</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground/80 font-medium">Facial Expression Analysis Model</strong> maps micro-expressions and facial landmarks in real-time.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-inner">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold font-display text-sm tracking-wide">LAM</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground/80 font-medium">Language Analysis Model</strong> processes semantic content, sentiment, and nuanced linguistic patterns.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-inner">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold font-display text-sm tracking-wide">CAFE</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground/80 font-medium">Context-Aware Fusion Engine</strong> synchronizes real-time multimodal inputs for cohesive processing.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 shadow-sm sm:col-span-2">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-inner">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold font-display text-sm tracking-wide">ERM</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground/80 font-medium">Emotion Recognition Model</strong> serves as the final analytical layer, translating fused multimodal data into a unified, explainable clinical score.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
