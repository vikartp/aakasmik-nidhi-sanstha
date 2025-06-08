import { useState } from "react";
import logo from "./assets/aakasmik-nidhi-logo.png";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://google.com" target="_blank">
          <img src={logo} className="logo react" alt="Aakasmik Nidhi logo" />
        </a>
      </div>
      <h1>Welcome to Contingency Fund Youth Association, Barkangango</h1>
      <h1>आकस्मिक निधि युवा संस्था बरकनगांगो</h1>
      <p>
        At the heart of Barkangango village lies a strong spirit of unity,
        compassion, and mutual support — values that form the foundation of the
        Contingency Fund Youth Association, Barkangango. We are a
        community-driven group made up of hundreds of dedicated individuals who
        believe in standing by each other during times of crisis. Every month,
        each member contributes a small amount to a shared fund. This collective
        effort builds a financial safety net that can be used to support any
        member facing an unexpected emergency — be it a medical issue, natural
        disaster, or any urgent personal crisis. Our mission is simple yet
        powerful: "Together, we are stronger." Through regular contributions and
        transparent management, we ensure that help is always available when
        someone in our community needs it the most. By coming together, we not
        only share financial responsibility but also foster a deep sense of
        belonging, solidarity, and hope among the youth of our village.
      </p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          You clicked {count} times
        </button>
      </div>
    </>
  );
}

export default App;
