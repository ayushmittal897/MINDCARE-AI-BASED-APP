import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Questionnaire } from "@/components/screening/Questionnaire";
import { ScreeningDashboard } from "@/components/screening/ScreeningDashboard";
import { useAuthStore } from "@/store/authStore";
import type { QuestionnaireAnswer, ScreeningResult, ScreeningRequest } from "@mindcare/types";

import { useQueryClient } from "@tanstack/react-query";
import { useAnalysisStore } from "@/store/analysisStore";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

import { Input } from "@/components/ui/input";

export function ScreeningPage() {
  const queryClient = useQueryClient();
  const globalResult = useAnalysisStore((s) => s.screeningResult);
  const setScreeningResult = useAnalysisStore((s) => s.setScreeningResult);
  const patientName = useAnalysisStore((s) => s.patientName);
  const patientAge = useAnalysisStore((s) => s.patientAge);
  const setPatientInfo = useAnalysisStore((s) => s.setPatientInfo);
  
  const [consentGiven, setConsentGiven] = useState(!!globalResult);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((s) => s.accessToken);

  const handleComplete = async (answers: QuestionnaireAnswer[]) => {
    setIsSubmitting(true);
    try {
      const payload: ScreeningRequest = { answers };

      const res = await fetch(`${API}/screening`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to process screening");
      }

      const data = await res.json() as ScreeningResult;
      setScreeningResult(data);
      queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (error) {
      console.error("Screening error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Clinical Analysis Mind Assessment</h1>
        <p className="mt-2 text-muted-foreground">
          Complete the 40-question screening to generate a clinical assessment based solely on your answers.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border max-w-2xl">
          <div className="space-y-2">
            <label htmlFor="patientNameScreening" className="text-sm font-medium leading-none">Patient Name</label>
            <Input 
              id="patientNameScreening"
              placeholder="Enter name"
              value={patientName}
              onChange={(e) => setPatientInfo(e.target.value, patientAge)}
              disabled={consentGiven} // lock it once assessment begins
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="patientAgeScreening" className="text-sm font-medium leading-none">Age</label>
            <Input 
              id="patientAgeScreening"
              type="number"
              placeholder="Enter age"
              value={patientAge}
              onChange={(e) => setPatientInfo(patientName, e.target.value)}
              disabled={consentGiven} // lock it once assessment begins
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="text-sm font-semibold text-primary mb-1">Clinical Methodology</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            These questions are derived from internationally recognized, standardized clinical assessment tools, including the <strong>PHQ-9</strong> (Patient Health Questionnaire for depression), <strong>GAD-7</strong> (General Anxiety Disorder-7), and <strong>PCL-5</strong> (PTSD Checklist). They are the gold-standard screening methods used by medical professionals worldwide to evaluate emotional and psychological well-being.
          </p>
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-3 border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium">
              <strong>MEDICAL DISCLAIMER:</strong> This app is a screening/demonstration tool, is NOT a medical diagnosis, and is NOT a substitute for consultation with a licensed mental health professional.
            </p>
          </div>
        </div>
      </div>

      {!consentGiven ? (
        <Card className="max-w-2xl mx-auto shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              <CardTitle>Data Privacy & Consent</CardTitle>
            </div>
            <CardDescription>Please review how your data will be handled before proceeding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              By proceeding with this Clinical Analysis Mind Assessment, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your responses will be securely stored and analyzed to generate a clinical score.</li>
              <li>Your results are strictly confidential and will only be accessible by you and approved medical professionals on this platform.</li>
              <li>Other users will not have access to your data or assessment results.</li>
              <li>This tool is for screening purposes and does not replace professional medical diagnosis.</li>
            </ul>
            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.history.back()}>Decline & Go Back</Button>
              <Button 
                className="w-full sm:w-auto" 
                onClick={() => setConsentGiven(true)}
                disabled={!patientName.trim() || !patientAge.toString().trim()}
              >
                {(!patientName.trim() || !patientAge.toString().trim()) ? "Enter Name & Age to Start" : "I Agree, Start Assessment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !globalResult ? (
        <Questionnaire onComplete={handleComplete} isSubmitting={isSubmitting} />
      ) : (
        <ScreeningDashboard result={globalResult} onRetake={() => { setScreeningResult(null); setConsentGiven(false); }} />
      )}
    </div>
  );
}
