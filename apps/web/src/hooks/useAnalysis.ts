import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { runAnalysis, getHistory } from "@/api/analysis";
import { approxBytesFromBase64 } from "@/lib/media";
import { useAnalysisStore } from "@/store/analysisStore";

export function useRunAnalysis() {
  const setResult = useAnalysisStore((s) => s.setResult);
  const setLastRun = useAnalysisStore((s) => s.setLastRun);
  const setError = useAnalysisStore((s) => s.setError);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runAnalysis,
    onMutate: async (vars) => {
      const audioKb = vars.audioBase64 ? Math.round(approxBytesFromBase64(vars.audioBase64) / 1024) : undefined;
      setLastRun({
        transcriptChars: vars.transcript?.length ?? 0,
        transcriptText: vars.transcript,
        hasAudio: Boolean(vars.audioBase64 && vars.audioBase64.length > 0),
        audioKb,
        hasVideoFrame: Boolean(vars.videoBase64 && vars.videoBase64.length > 0),
        videoFrameBase64: vars.videoBase64,
        sentAt: new Date().toISOString(),
      });
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (e: Error) => setError(e.message),
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
