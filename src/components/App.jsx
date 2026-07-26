import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../style/App.css'
import Header from './Header.jsx'
import Aboutme from './Aboutme.jsx'
import Education from './Education.jsx'
import Experience from './Experience.jsx'
import Footer from './Footer.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <Header />
    <Aboutme />
    <Education />
    <Experience />
    <Footer />
  </>,
)
