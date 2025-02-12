require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

const app = express();
const PORT = 5000;

// Enable CORS & JSON handling
app.use(cors());
app.use(express.json());

// Create 'uploads' directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🔹 Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename to avoid conflicts
  },
});

const upload = multer({ storage });

// 🔹 OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure you set this in your .env file
});

// 🔹 Upload & Process Resume
app.post('/upload', upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    console.log(`✅ Successfully processed resume: ${req.file.originalname}`);

    // Delete the uploaded file after processing to avoid clutter
    fs.unlinkSync(pdfPath);

    res.json({ success: true, text: extractedText });
  } catch (error) {
    console.error("❌ Error processing resume:", error);
    res.status(500).json({ success: false, message: "Error processing resume" });
  }
});

// 🔹 ChatGPT Resume Analysis
app.post('/analyze', async (req, res) => {
  const { resumeText, userRole, experience } = req.body;

  if (!resumeText || !userRole || !experience) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const prompt = `
      I have a resume with the following details:

      **Resume Text:**
      ${resumeText}

      The user is applying for a **${userRole}** role with **${experience} years** of experience.

      Please analyze the resume and suggest improvements tailored to this role, focusing on:
      - 🔹 Missing keywords
      - 🔹 Strengthening bullet points
      - 🔹 Formatting improvements
      - 🔹 Industry-specific suggestions

      Provide suggestions in a **clear, numbered list format** for easy readability.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Using GPT-4 for more detailed responses
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ success: true, suggestions: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    res.status(500).json({ success: false, message: "AI analysis failed" });
  }
});

// 🔹 Delete Uploaded Files on Server Exit
const cleanUploads = () => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("❌ Error reading uploads directory:", err);
      return;
    }
    files.forEach(file => {
      fs.unlink(`${uploadDir}/${file}`, err => {
        if (err) console.error("❌ Error deleting file:", file);
      });
    });
    console.log("🗑️ All uploaded files deleted.");
  });
};

// 🔹 Handle Graceful Shutdown (CTRL + C)
process.on('SIGINT', () => {
  console.log("\n🛑 Shutting down server...");
  cleanUploads();
  process.exit(0);
});

// 🔹 Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
