
import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home'
import Upload from './pages/upload.js'

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      // .then(console.log("WORKING"))
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, [data]);
  return (
<BrowserRouter>
     
      <Routes>
        <Route path="/" element={<Home />} >
        </Route>
        <Route path="/upload" element={<Upload />} >
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
