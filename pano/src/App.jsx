import { useState } from 'react'
import Hero from './pages/Hero'
import Landing from './pages/Landing'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Hero />
      <Landing />
    </>
  )
}

export default App
