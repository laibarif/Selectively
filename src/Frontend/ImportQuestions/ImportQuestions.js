import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function ImportQuestions() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Create a ref for the file input
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".xlsx")) {
      setFile(selectedFile);
      setMessage("");
    } else {
      setMessage("Please upload a valid Excel file (.xlsx)");
      hideMessageAfterDelay();
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file before uploading.");
      hideMessageAfterDelay();
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
      hideMessageAfterDelay();

      // Clear the file input after successful upload
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error("File upload failed:", error);
      setMessage(error.response?.data?.message || "Failed to upload the file.");
      hideMessageAfterDelay();
    } finally {
      setLoading(false);
    }
  };

  // Utility function to hide message after 3 seconds
  const hideMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="max-w-lg mx-auto p-12 bg-gray-50 rounded-lg shadow-md mt-40">
      <h2 className="text-3xl font-bold mb-10 text-center">Import Questions</h2>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="mb-10 w-full"
      />
      <button
        onClick={handleUpload}
        className="w-full px-4 py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-400"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && <h4 className="mt-4 text-center text-red-500 font-bold">{message}</h4>}
    </div>
  );
}

export default ImportQuestions;
