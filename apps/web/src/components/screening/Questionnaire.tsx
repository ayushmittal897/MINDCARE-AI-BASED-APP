import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

import { AlertTriangle } from "lucide-react";
import type { QuestionnaireAnswer } from "@mindcare/types";

export const QUESTIONS = [
  { id: 1, text: "How often have you felt unusually low or down recently?" },
  { id: 2, text: "How often do you feel hopeless about the future?" },
  { id: 3, text: "How often have you felt bad about yourself, or that you are a failure?" },
  { id: 4, text: "How often do you have little interest or pleasure in doing things you usually enjoy?" },
  { id: 5, text: "How often do you feel a sense of enjoyment in your daily activities?" },
  { id: 6, text: "How often do you feel nervous, anxious, or on edge?" },
  { id: 7, text: "How often do you feel you cannot stop or control worrying?" },
  { id: 8, text: "How often do you have trouble relaxing?" },
  { id: 9, text: "How often do you worry too much about different things?" },
  { id: 10, text: "How often do you feel afraid, as if something awful might happen?" },
  { id: 11, text: "How often do you feel overwhelmed by your responsibilities?" },
  { id: 12, text: "How often do you feel capable of coping with the things you have to do?" },
  { id: 13, text: "How often do you have trouble falling asleep or staying asleep?" },
  { id: 14, text: "How often do you sleep too much?" },
  { id: 15, text: "How often do you wake up feeling well-rested?" },
  { id: 16, text: "How often do you feel tired or have little energy?" },
  { id: 17, text: "How often do you feel vibrant and energetic throughout the day?" },
  { id: 18, text: "How often do you have trouble concentrating on things, such as reading or watching TV?" },
  { id: 19, text: "How often do you find it easy to focus on complex tasks?" },
  { id: 20, text: "How often do you feel motivated to start new projects or tasks?" },
  { id: 21, text: "How often do you find yourself procrastinating because you lack the drive?" },
  { id: 22, text: "How often do you feel connected and close to the people around you?" },
  { id: 23, text: "How often do you withdraw from friends or social activities?" },
  { id: 24, text: "How often do you feel lonely or isolated?" },
  { id: 25, text: "How often do your feelings interfere with your ability to get your work done?" },
  { id: 26, text: "How often do you successfully manage your daily chores and self-care?" },
  { id: 27, text: "How often do you become easily annoyed or irritable?" },
  { id: 28, text: "How often do you feel in control of your emotional reactions?" },
  { id: 29, text: "How often do you experience sudden mood swings?" },
  { id: 30, text: "How often do you use healthy strategies (like exercise or talking) to deal with stress?" },
  { id: 31, text: "How often do you turn to unhealthy habits when you feel distressed?" },
  { id: 32, text: "How often do you feel cheerful and in good spirits?" },
  { id: 33, text: "How often do you feel calm and relaxed?" },
  { id: 34, text: "How often do you feel active and vigorous?" },
  { id: 35, text: "How often do you wake up feeling fresh and rested?" },
  { id: 36, text: "How often do you feel that your daily life is filled with things that interest you?" },
  { id: 37, text: "How often do you feel that your life has meaning and purpose?" },
  { id: 38, text: "How often do you feel proud of something you've accomplished recently?" },
  { id: 39, text: "How often do you have thoughts that you would be better off dead, or of hurting yourself?" },
  { id: 40, text: "How often do you feel completely unable to cope with life's demands?" },
];

const OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Slight / occasionally" },
  { value: 2, label: "Moderate / frequently" },
  { value: 3, label: "Severe / almost always" },
];

interface Props {
  onComplete: (answers: QuestionnaireAnswer[]) => void;
  isSubmitting: boolean;
}

export function Questionnaire({ onComplete, isSubmitting }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const [showEarlySubmitWarning, setShowEarlySubmitWarning] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = Math.round(((currentIndex) / QUESTIONS.length) * 100);

  if (!currentQuestion) return null;

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    setError("");
  };

  const handleNext = () => {
    if (answers[currentQuestion.id] === undefined) {
      setError("Please select an answer before continuing.");
      return;
    }
    setCurrentIndex((p) => (p < QUESTIONS.length - 1 ? p + 1 : p));
  };

  const handlePrevious = () => {
    setCurrentIndex((p) => (p > 0 ? p - 1 : p));
    setError("");
  };

  const handleSkip = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((p) => (p < QUESTIONS.length - 1 ? p + 1 : p));
      setError("");
    } else {
      handleSubmitEarly();
    }
  };

  const handleSubmitEarly = () => {
    const finalAnswers: QuestionnaireAnswer[] = QUESTIONS
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        answer: answers[q.id],
      }));
    onComplete(finalAnswers);
  };

  const handleSubmit = () => {
    if (answers[currentQuestion.id] === undefined) {
      setError("Please select an answer before submitting.");
      return;
    }
    handleSubmitEarly();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/30 shadow-soft">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Question {currentIndex + 1} / {QUESTIONS.length}</span>
          <span className="text-sm font-normal text-muted-foreground">{progress}%</span>
        </CardTitle>
        <div className="h-2 mt-2 w-full bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      
      <CardContent className="py-6 min-h-[200px]">
        <h2 className="text-xl font-medium mb-8 text-foreground">
          {currentQuestion.text}
        </h2>
        
        <div className="grid gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                handleSelect(opt.value);
                setTimeout(() => {
                  setCurrentIndex((p) => (p < QUESTIONS.length - 1 ? p + 1 : p));
                }, 300); // Small delay to let the user see their selection before advancing
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all select-none ${
                answers[currentQuestion.id] === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion.id] === opt.value
                    ? "border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {answers[currentQuestion.id] === opt.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className={answers[currentQuestion.id] === opt.value ? "font-medium text-primary" : "text-foreground"}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <span>For the most accurate assessment, please answer as many questions as possible.</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 bg-muted/20 p-4 border-t">
        <div className="flex flex-col-reverse sm:flex-row w-full justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentIndex === 0 || isSubmitting}
            className="w-full sm:w-auto"
          >
            &larr; Previous
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting} className="w-full sm:w-auto">
              Skip Question
            </Button>
            {currentIndex === QUESTIONS.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Analyzing..." : "Analyze Responses"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Next &rarr;
              </Button>
            )}
          </div>
        </div>
        <div className="flex w-full justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto text-amber-600 border-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-500 dark:border-amber-500 dark:hover:bg-amber-950/30" 
            onClick={() => setShowEarlySubmitWarning(true)} 
            disabled={isSubmitting || Object.keys(answers).length === 0}
          >
            Submit early with current answers
          </Button>
        </div>
      </CardFooter>

      {/* Early Submit Warning Modal */}
      {showEarlySubmitWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-card border shadow-xl rounded-xl p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Are you sure?</h3>
            <p className="text-muted-foreground text-sm">
              If you submit the test early without completing all questions, the resulting clinical assessment may be <strong className="text-foreground">inaccurate</strong> and <strong className="text-foreground">not feasible</strong> for proper medical guidance.
            </p>
            <div className="pt-4 flex gap-3 justify-center w-full">
              <Button variant="outline" className="flex-1" onClick={() => setShowEarlySubmitWarning(false)}>
                Cancel, continue test
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                setShowEarlySubmitWarning(false);
                handleSubmitEarly();
              }}>
                Submit Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
