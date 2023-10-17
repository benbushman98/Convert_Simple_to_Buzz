import React from 'react'
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const Upload = () => {
    const [fileData, setFileData] = useState(null);
    const location = useLocation();
    const { message, fileName } = location.state;
    const fileNameNew = fileName.replace(/\.txt$/, '_Buzz.txt')

    const handleFileDownload = () => {
        // Replace with the URL of your server endpoint that serves the file
        const downloadUrl = `${fileNameNew}`; // Replace with the actual file name
        fetch(`/api/download/${downloadUrl}`)
            .then((response) => {
                if (response.ok) {
                    const test = response.blob();
                    return test; // Convert the response to a Blob
                } else {
                    throw new Error('File download failed');
                }
            })
            .then((blob) => {
                // Create a temporary URL for the Blob
                const fileUrl = URL.createObjectURL(blob);
                // Set the URL in the state to trigger a download link
                setFileData(fileUrl);
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle any error logic here
            });
    };

    return (
        <div>
            <h1>Download File</h1>
            <p>{message}</p>
            <button onClick={handleFileDownload}>Convert File</button>
            <br />
            <br />

            {fileData && (
                <a href={fileData} download={`${fileNameNew}`}>
                    Click here to Download Converted File
                </a>
            )}
        </div>
    );
};

export default Upload;
