import React, { useState } from 'react';
import { FileInputButton, FileCard } from "@files-ui/react";

/**
 * FileUpload component that allows users to upload a CSV file.
 * The component uses the FileInputButton and FileCard components from the @files-ui/react package.
 * @returns {JSX.Element} FileUpload component
 */
export const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const updateFiles = (incomingFiles) => {
    setFiles(incomingFiles);
    setSuccess(false);
    setError('');
  };

  const removeFile = (id) => {
    setFiles(prevFiles => prevFiles.filter((x) => x.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select a file first.');
      return;
    }

    const fileData = files[0];
    const file = fileData.file;

    setLoading(true);
    setSuccess(false);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Adjust URL to your real endpoint
      const res = await fetch(`http://backend-bonos-bonos-qa.apps.okd.swcomfaboy.com.co/api/tsumbeneficiary/upload/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer sXnVlpgunODr5Lvkqvoa6uFcivQ4K8',
        },
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setResult(data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('There was a problem uploading the file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Upload CSV File</h1>

      <FileInputButton
        onChange={updateFiles}
        value={files}
        autoClean
        //accept={".csv"}
        maxFiles={1}
        actionButtons={{
          position: "after",
          uploadButton: {
            style: { textTransform: "uppercase" },
            onClick: handleUpload,
          },
          abortButton: {},
          cleanButton: {},
          deleteButton: {
            style: { textTransform: "uppercase" },
            onClick: () => {
              setFiles([]); 
              setResult(null); 
              setSuccess(false);
              setError('');
            },
          }
        }}
      />

      <br />

      {/* If files are selected, display them as FileCards */}
      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "5px",
            marginTop: "25px",
            minWidth: "50%"
          }}
        >
          {files.map((fileData) => (
            <FileCard
              key={fileData.id}
              {...fileData}
              onDelete={removeFile}
              uploadStatus={loading ? "uploading" : success ? "success" : error ? "error" : "idle"}
              info
              preview
            />
          ))}
        </div>
      )}

      <br />
      {/* Status messages */}
      {loading && <p>Uploading... Please wait.</p>}
      {success && <p style={{ color: 'green' }}>File uploaded successfully!</p>}
      {result && (
        <div>
          <p>Processed: {result.processed}</p>
          <p>Omitted: {result.omitted}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};