import React, { useState } from "react";
import axios from "axios";

function ImportQuestions() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".xlsx")) {
      setFile(selectedFile);
      setMessage("");
    } else {
      setMessage("Please upload a valid Excel file (.xlsx)");
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/addQuestions/import-questions`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(response.data.message);
      setFile(null);
    } catch (error) {
      console.error("File upload failed:", error);
      setMessage(error.response?.data?.message || "Failed to upload the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-12 bg-gray-50 rounded-lg shadow-md mt-40">
      <h2 className="text-2xl font-bold mb-10 text-center">Import Questions</h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="mb-10 w-full"
      />
      <button
        onClick={handleUpload}
        className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-blue-500"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}

export default ImportQuestions;
