import React from "react";
import { createRoot } from "react-dom/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ClinicalAssessmentPrintView } from "@/components/reports/ClinicalAssessmentPrintView";
import { WellnessReportPrintView } from "@/components/reports/WellnessReportPrintView";
import type { AnalysisResult, ScreeningResult, User } from "@mindcare/types";

interface ExportOptions {
  template: "clinical" | "wellness";
  result: AnalysisResult | null;
  screeningResult: ScreeningResult | null;
  patientName?: string;
  patientAge?: string;
  user: User | null;
}

export async function generateReportPDF(options: ExportOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    // Place off-screen but retain full dimensions in the viewport calculation
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "-9999px";
    container.style.width = "210mm";
    container.style.minHeight = "297mm";
    container.style.backgroundColor = "#ffffff";
    document.body.appendChild(container);

    const root = createRoot(container);
    const ComponentToRender = options.template === "clinical" ? ClinicalAssessmentPrintView : WellnessReportPrintView;
    root.render(React.createElement(ComponentToRender, options));

    // Wait for React to paint and fonts to load
    setTimeout(async () => {
      try {
        console.log("Container dimensions before capture:", {
          offsetWidth: container.offsetWidth,
          offsetHeight: container.offsetHeight,
          scrollWidth: container.scrollWidth,
          scrollHeight: container.scrollHeight
        });

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
          logging: true // Help debug CSS parsing errors in console
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        console.log("Captured canvas data length:", imgData.length);

        if (imgData.length < 500) {
          throw new Error("Canvas appears to be empty/blank.");
        }

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        // Calculate proper height ratio based on canvas
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // If the content is longer than one page, addImage will just push it down
        // It won't automatically paginate with just addImage unless we slice the canvas.
        // For now, ensuring the ratio is preserved is key to not getting a blank doc.
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        const pdfBase64 = pdf.output("datauristring");
        
        root.unmount();
        document.body.removeChild(container);
        resolve(pdfBase64);
      } catch (err) {
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    }, 1500); // Wait 1.5s to ensure full paint
  });
}
