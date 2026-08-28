import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const questionPaper = formData.get("questionPaper") as File | null;
    const answerSheet = formData.get("answerSheet") as File | null;

    if (!questionPaper || !answerSheet) {
      return NextResponse.json(
        { error: "Both questionPaper and answerSheet files are required." },
        { status: 400 }
      );
    }

    // Convert uploaded files to base64 buffers
    const qpBuffer = Buffer.from(await questionPaper.arrayBuffer());
    const ansBuffer = Buffer.from(await answerSheet.arrayBuffer());

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Updated to gemini-3.6-flash
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
    You are an AI exam evaluator. Compare the Student Answer Sheet against the Question Paper.
    Analyze each question, evaluate the correctness of the student's answer, assign marks, and provide short feedback.
    
    Return ONLY a valid raw JSON object matching this exact structure (no markdown formatting, no code blocks):
    {
      "totalScore": 15,
      "maxScore": 15,
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "Question text here",
          "score": 5,
          "maxMarks": 5,
          "feedback": "Feedback here"
        }
      ]
    }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: qpBuffer.toString("base64"),
          mimeType: questionPaper.type || "application/pdf",
        },
      },
      {
        inlineData: {
          data: ansBuffer.toString("base64"),
          mimeType: answerSheet.type || "application/pdf",
        },
      },
    ]);

    const responseText = await result.response.text();
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process assessment." },
      { status: 500 }
    );
  }
}