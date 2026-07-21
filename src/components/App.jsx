import { useState } from 'react'
import '../style/App.css'
import Header from './Header.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Header />
    </>
  )
}

export default App
