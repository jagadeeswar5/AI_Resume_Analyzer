AI Resume Analyzer
🚀 AI-powered Resume Analyzer that helps users upload resumes, analyze content, and get ChatGPT-based suggestions to improve them.

✨ Features
✅ Upload a PDF Resume
✅ Extracts text from the uploaded file
✅ Uses ChatGPT (GPT-4) to analyze resume
✅ Provides tailored suggestions for improvement
✅ Simple React frontend with file upload & user input
✅ Node.js backend with Express, Multer, and OpenAI integration

📂 Project Structure
php
Copy
Edit
AI_Resume_Analyzer/
│── backend/           # Node.js server (API & AI processing)
│   ├── server.js      # Express backend with Multer & OpenAI
│   ├── package.json   # Backend dependencies
│── frontend/          # React frontend
│   ├── src/           # React source files
│   ├── public/        # Static files
│   ├── package.json   # Frontend dependencies
│── uploads/           # Temporary uploaded files (auto-deleted)
│── README.md          # Project documentation
│── .gitignore         # Git ignore rules
🛠 Installation & Setup
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/JagadeeswarKamireddy/AI_Resume_Analyzer.git
cd AI_Resume_Analyzer
2️⃣ Backend Setup
sh
Copy
Edit
cd backend
npm install      # Install dependencies
Environment Variables: Create a .env file inside backend/:

ini
Copy
Edit
OPENAI_API_KEY=your_openai_api_key
Start the backend:

sh
Copy
Edit
node server.js
3️⃣ Frontend Setup
sh
Copy
Edit
cd ../frontend
npm install      # Install frontend dependencies
npm start       # Runs the React app
The frontend will be available at http://localhost:3000/.

🛠 Tech Stack
Frontend: React.js, Axios
Backend: Node.js, Express.js, Multer
AI API: OpenAI (GPT-4)
PDF Parsing: pdf-parse
📸 Screenshots
Upload Resume	AI Suggestions
📜 License
This project is open-source and available under the MIT License.

👨‍💻 Author
Jagadeeswar Kamireddy
