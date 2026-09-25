import { Activity, LayoutDashboard, Menu, Moon, Settings, Sun, Stethoscope, X, ArrowLeft, RefreshCw, Shield, Users, User as UserIcon, LogOut, Lock } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/analysis", label: "Session", icon: Activity },
  { to: "/dashboard?tab=session", label: "Session Reports", icon: Activity },
  { to: "/screening", label: "Clinical Assessments", icon: Stethoscope },
  { to: "/dashboard?tab=clinical", label: "Clinical Assessment Reports", icon: Stethoscope },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const { enabled: sessionTabEnabled } = useFeatureFlag('session_tab');

  const getNavLinks = () => {
    let currentNav = [...nav].map(item => ({ ...item, locked: false }));
    
    if (user?.role === "admin") {
      currentNav.push({ to: "/admin", label: "Admin Portal", icon: Shield, locked: false });
    } else {
      // For non-admins, respect the feature flag by locking it instead of hiding
      if (!sessionTabEnabled) {
        currentNav = currentNav.map(item => {
          if (item.to === '/analysis' || item.label.includes('Session')) {
            return { ...item, locked: true };
          }
          return item;
        });
      }
    }
    
    if (user?.role === "clinician") {
      currentNav.push({ to: "/doctor", label: "Clinician Portal", icon: Users, locked: false });
    }
    
    return currentNav;
  };

  const currentNav = getNavLinks();

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  const isLinkActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    const [path, search] = to.split("?");
    
    if (location.pathname !== path) return false;
    
    if (search) {
      return location.search.includes(search);
    } else {
      // If the link has NO search params, it should only be active if the current URL has NO tab search params
      return !location.search || !location.search.includes("tab=");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
              <Activity className="h-5 w-5" />
            </span>
            MindCare
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {currentNav.map((item) => {
              const isActive = isLinkActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.locked ? "#" : item.to}
                  onClick={(e) => {
                    if (item.locked) {
                      e.preventDefault();
                      toast.error("This feature is currently locked by the administrator");
                    }
                  }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
                    item.locked
                      ? "text-muted-foreground/50 opacity-60 cursor-not-allowed"
                      : isActive
                      ? "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                  {item.locked && <Lock className="w-3.5 h-3.5 opacity-70" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => window.history.back()} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => window.location.reload()} aria-label="Reload page">
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {token ? (
              <ProfileMenu />
            ) : (
              <span className="hidden text-xs text-muted-foreground sm:inline">Demo: sign in on Home</span>
            )}
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button type="button" className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,280px)] flex-col border-l border-border bg-card p-4 shadow-xl">
            <div className="mb-4 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {currentNav.map((item) => {
              const isActive = isLinkActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.locked ? "#" : item.to}
                  onClick={(e) => {
                    if (item.locked) {
                      e.preventDefault();
                      toast.error("This feature is currently locked by the administrator");
                    } else {
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    "rounded-lg px-3 py-3 text-sm font-medium flex items-center justify-between",
                    item.locked
                      ? "text-muted-foreground/50 opacity-60 cursor-not-allowed"
                      : isActive ? "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                  {item.locked && <Lock className="w-4 h-4 opacity-70" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground/80 mb-1">© 2026 MindCare. All rights reserved.</p>
            <p>This app is a screening/demonstration tool, is NOT a medical diagnosis, and is NOT a substitute for consultation with a licensed mental health professional.</p>
          </div>
          <div className="flex gap-4 font-medium">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useLogout();
  
  if (!user) return null;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Profile" className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary">
        <UserIcon className="h-5 w-5" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-border/40 bg-background/95 backdrop-blur-xl p-2 text-foreground shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 origin-top-right">
            <div className="px-3 py-2 border-b border-border/40 mb-2">
              <div className="text-sm font-semibold truncate tracking-tight">
                {user.name || "Demo User"}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </div>
              <div className="text-[10px] text-muted-foreground/70 truncate mt-1 font-mono bg-muted/50 rounded px-1 py-0.5 w-fit">
                ID: {user.patientId || user.id}
              </div>
            </div>
            
            <button
              onClick={() => { setOpen(false); logout.mutate(); }}
              className="relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all hover:bg-red-500/10 text-red-500 hover:text-red-600 active:bg-red-500/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
