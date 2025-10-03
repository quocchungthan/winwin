import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  return (
    <main>
      <h1>Đăng nhập Bầu Cua Tôm Cá</h1>
      <p>Nhập số điện thoại và tên hiển thị để bắt đầu chơi.</p>
      {/* Login Form UI */}
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <LoginForm />
      </div>
    </main>
  );
}

import LoginForm from './LoginForm';
export default App
