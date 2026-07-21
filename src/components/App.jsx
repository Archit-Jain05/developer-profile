import { useState } from 'react'
import '../style/App.css'
import Header from './Header.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Biodata from './Biodata.jsx'
import Footer from './Footer.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <Header />
    <Biodata />
    <Footer />
  </>,
)
