import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/homePage'
import ComplainPage from './pages/complainPage'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
 

  return (
    <>
     <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/complaint' element={<ComplainPage />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
