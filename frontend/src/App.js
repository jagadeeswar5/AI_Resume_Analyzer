import './App.css';
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [userRole, setUserRole] = useState("");
  const [experience, setExperience] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return alert("Please select a file to upload.");
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeText(response.data.text);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !userRole || !experience) {
      return alert("Please fill out all fields before analysis.");
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/analyze", {
        resumeText,
        userRole,
        experience,
      });

      setSuggestions(response.data.suggestions.split("\n").filter(line => line.trim() !== ""));
      setLoading(false);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Analysis failed!");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>

      {/* File Upload Section */}
      <div className="file-upload">
        <input type="file" onChange={handleFileChange} className="file-input" />
        <button className="button upload-btn" onClick={handleUpload}>Upload</button>
      </div>

      {/* Job Role & Experience Input */}
      {resumeText && (
        <div>
          <h3>Resume Uploaded!</h3>
          <div className="input-container">
            <label>Job Role:</label>
            <input type="text" value={userRole} onChange={(e) => setUserRole(e.target.value)} />

            <label>Experience (years):</label>
            <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>

          <div className="button-container">
            <button className="button analyze-btn" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      )}
      
      {/* AI Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="card suggestions">
          <h3>AI Suggestions</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
