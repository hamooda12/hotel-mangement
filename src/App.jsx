import { useState } from 'react'
import { Home } from './Pages/Home'
import { Layout } from './Pages/Layout'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  const [count, setCount] = useState(0)

  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
             <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
