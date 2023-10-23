import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
                .then((response) => {
                    if (response.ok) {
                        console.log('File uploaded successfully');

                        // Handle any success logic here

                        // Redirect to /upload and pass information
                        navigate('/convert', { state: { message: 'File uploaded successfully',fileName: selectedFile.name } });
                    } else {
                        console.log(response)
                        console.error('File upload failed');
                        // Handle any error logic here
                    }
                })
                .catch((error) => {
                    console.error('An error occurred while uploading the file', error);
                    // Handle any error logic here
                });
        }
    };

    return (
        <>
            <h1>Upload a .txt file</h1>
            <input type="file" name="file" accept=".txt" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
        </>
    );
};

export default Home;
