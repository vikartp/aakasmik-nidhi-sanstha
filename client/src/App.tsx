import { useState } from 'react'
import logo from './assets/aakasmik-nidhi-logo.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://google.com" target="_blank">
          <img src={logo} className="logo react" alt="Aakasmik Nidhi logo" />
        </a>
      </div>
      <h1>आकस्मिक निधि युवा संस्था बरकनगांगो</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          You clicked {count} times
        </button>
      </div>
    </>
  )
}

export default App
