# 📝 AI Answer Evaluator

An intelligent assessment evaluation application built with **Next.js**, **TypeScript**, and the **Google Gemini API**. It enables automated scoring, detailed question-by-question evaluations, and feedback generation by comparing student answer sheets against question papers.

🔗 **Live Demo:** [https://ai-answer-evaluator-self.vercel.app/](https://ai-answer-evaluator-self.vercel.app/)

---

## ✨ Features

- **Multimodal Document Uploads:** Accepts Question Papers and Answer Sheets in both PDF and image formats.
- **Automated AI Evaluation:** Leverages Google's Gemini multimodal AI model to parse, extract, and compare student answers against original questions.
- **Detailed Question Feedback:** Provides dynamic score breakdowns (Marks Obtained / Max Marks) along with precise feedback for every question.
- **Document Preview Support:** Includes inline previews for image-based uploads and fallback handlers for PDF documents.
- **Production-Ready & Responsive UI:** Clean, dark-themed user interface built for high usability and seamless error handling.

---

## 🏗️ System Architecture

The application is built as a unified Next.js Full-Stack App:

[ Frontend: Next.js Client Component ]
│
▼  (Multipart Form Data Upload)
[ API Route: /api/process ]
│
├── File Buffer & Base64 Conversion
│
▼
[ Google Gemini API (gemini-3.6-flash) ]
│
▼  (JSON Prompt Extraction)
[ Frontend UI Render ] 

1. **Client Layer (`app/page.tsx`):** Captures PDF/image files from the user, generates client-side image previews, and submits a multipart `FormData` request to the backend.
2. **Backend API (`app/api/process/route.ts`):** Receives raw file streams, converts them to Base64 buffers, constructs a structured evaluation prompt, and routes requests to Google Gemini's multimodal API.
3. **Structured Response Processing:** Sanitizes AI responses, extracts structured JSON data, and handles schema key mappings dynamically for resilient frontend rendering.

---

## 📡 API Documentation

### `POST /api/process`

Evaluates a submitted Answer Sheet against a Question Paper.

#### Request Headers
- `Content-Type`: `multipart/form-data`

#### Request Body (FormData)
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `questionPaper` | `File` (PDF / Image) | **Yes** | The original question paper document. |
| `answerSheet` | `File` (PDF / Image) | **Yes** | The student's written/typed answer sheet. |

#### Response Format (`200 OK`)
```json
{
  "totalScore": 15,
  "maxScore": 15,
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Explain the concept of Object-Oriented Programming (OOP)...",
      "score": 5,
      "maxMarks": 5,
      "feedback": "Excellent definition of OOP and all four main pillars are correctly listed."
    }
  ]
}
Error Response (400 / 500)
JSON
{
  "error": "Both questionPaper and answerSheet files are required."
}
🧠 Evaluation Methodology
Document Ingestion: Converts uploaded documents into Base64 inline data arrays passed directly into Gemini's vision-language pipeline.

Context Matching: Analyzes the Question Paper to extract individual question prompts, intent, and maximum marks allocated.

Semantic Scoring: Compares student responses against expected domain concepts rather than enforcing strict string matching (evaluating conceptual understanding, completeness, and correctness).

Structured JSON Output: Forces strict JSON output formatting to ensure seamless UI mapping without markdown parsing breaks.

🛠️ Tech Stack
Framework: Next.js (App Router)

Language: TypeScript

AI Integration: @google/generative-ai (Google Gemini API)

Deployment: Vercel

🚀 Getting Started Locally
1. Clone the repository
Bash
git clone [https://github.com/muvvala-sujana/ai-answer-evaluator.git](https://github.com/muvvala-sujana/ai-answer-evaluator.git)
cd ai-answer-evaluator
2. Install dependencies
Bash
npm install
3. Set up environment variables
Create a .env.local file in the root directory:

Code snippet
GEMINI_API_KEY=your_google_gemini_api_key_here
4. Run the development server
Bash
npm run dev
Open http://localhost:3000 in your browser to view the application.


---

### Push Command for Terminal

Run this single command in your VS Code terminal to save and push all changes directly to GitHub:

```powershell
git add README.md ; git commit -m "Add complete documentation to README" ; git push origin main

---

---

## 👤 Author

**Muvvala Sujana**
- **Email:** [sujanamuvvala02@gmail.com](mailto:sujanamuvvala02@gmail.com)
- **LinkedIn:** [Sujana Muvvala](https://www.linkedin.com/in/sujana-muvvala-5491192b9/)
- **GitHub:** [@MuvvalaSujana](https://github.com/MuvvalaSujana)
