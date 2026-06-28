import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateRoadmapPDF(roadmapTitle: string, tasks: string[]) {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Embed the Times Roman font
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Add a blank page to the document
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  // Draw the Title
  page.drawText(`Career Roadmap: ${roadmapTitle}`, {
    x: 50,
    y: height - 50,
    size: 24,
    font: timesRomanBoldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Draw tasks
  let yPosition = height - 100;
  for (const task of tasks) {
    if (yPosition < 50) {
      // Create a new page if we run out of room
      // (Simplified logic for now)
      break; 
    }
    page.drawText(`• ${task}`, {
      x: 60,
      y: yPosition,
      size: 14,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function downloadPDF(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
