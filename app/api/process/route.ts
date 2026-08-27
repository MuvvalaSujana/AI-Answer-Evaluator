import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper to convert uploaded files to Gemini inlineData objects
async function fileToGenerativePart(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Default to image/png if mimeType is missing or unrecognized
  let mimeType = file.type;
  if (!mimeType || mimeType === "application/octet-stream") {
    if (file.name.endsWith(".png")) mimeType = "image/png";
    else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (file.name.endsWith(".webp")) mimeType = "image/webp";
    else mimeType = "image/png"; 
  }

  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const qpFiles = formData.getAll("questionPaper") as File[];
    const ansFiles = formData.getAll("answerSheet") as File[];

    if (!qpFiles.length || !ansFiles.length) {
      return NextResponse.json(
        { error: "Please upload both question paper and answer sheet." },
        { status: 400 }
      );
    }

    // Convert all uploaded files into generative inline parts
    const qpParts = await Promise.all(qpFiles.map(fileToGenerativePart));
    const ansParts = await Promise.all(ansFiles.map(fileToGenerativePart));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      You are an automated assessment evaluator. Analyze the attached Question Paper image(s) and Student Answer Sheet image(s).
      
      Extract all questions from the Question Paper. Then locate, map, and grade the student's handwritten/typed answers from the Answer Sheet.

      Return ONLY a JSON object strictly matching this schema:
      {
        "questions": [
          {
            "id": "q1",
            "qNumber": "1",
            "questionText": "Question text here",
            "maxMarks": 5
          }
        ],
        "evaluations": [
          {
            "questionId": "q1",
            "status": "ANSWERED",
            "studentAnswerText": "Extracted answer text",
            "awardedMarks": 5,
            "feedback": "Short evaluation feedback",
            "regions": [
              {
                "pageIndex": 1,
                "box2d": [100, 100, 400, 900]
              }
            ]
          }
        ]
      }
      
      Note: 'box2d' must be normalized coordinates [ymin, xmin, ymax, xmax] from 0 to 1000 representing the bounding box of where the answer appears on the answer sheet page.
    `;

    const response = await model.generateContent([
      prompt,
      ...qpParts,
      ...ansParts,
    ]);

    const resultText = response.response.text();
    const parsedData = JSON.parse(resultText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during evaluation." },
      { status: 500 }
    );
  }
}