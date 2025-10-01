import './App.css'

import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const callHelloFunction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/hello');
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Error calling function');
    }
    setLoading(false);
  };

  return (
    <main>
      <h1>Hello from TikTok Bầu Cua Tôm Cá!</h1>
      <p>This is the skeleton app. To test the Netlify function, visit <code>/.netlify/functions/hello</code> after deploying.</p>
      <button onClick={callHelloFunction} disabled={loading}>
        {loading ? 'Calling...' : 'Call Hello Function'}
      </button>
      {message && <p>Function response: {message}</p>}
    </main>
  );
}

export default App
