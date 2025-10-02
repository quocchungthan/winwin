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
      <h1>Đăng nhập Bầu Cua Tôm Cá</h1>
      <p>Nhập số điện thoại và tên hiển thị để bắt đầu chơi.</p>
      {/* Login Form UI */}
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <LoginForm />
      </div>
      <hr />
      <h2>Test Netlify Function</h2>
      <button onClick={callHelloFunction} disabled={loading}>
        {loading ? 'Calling...' : 'Call Hello Function'}
      </button>
      {message && <p>Function response: {message}</p>}
    </main>
  );
}

import LoginForm from './LoginForm';
export default App
