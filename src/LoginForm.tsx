import React, { useState } from 'react';

interface AccountResponse {
  guid: string;
  phone: string;
  displayName: string;
  balance: number;
  mockFlag: boolean;
}

const LoginForm: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePhone = (value: string) => /^\d{9,11}$/.test(value);
  const validateDisplayName = (value: string) => value.trim().length > 0;

  const handleCheckUsername = async () => {
    if (!validateDisplayName(displayName)) return;
    setChecking(true);
    setError('');
    setSuggestion('');
    try {
      const res = await fetch('/.netlify/functions/check-username?displayName=' + encodeURIComponent(displayName));
      const data = await res.json();
      if (!data.available) {
        setError('Tên đã tồn tại.');
        setSuggestion(data.suggestion || '');
      }
    } catch (e) {
      setError('Lỗi kiểm tra tên.');
    }
    setChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }
    if (!validateDisplayName(displayName)) {
      setError('Tên hiển thị không được để trống.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, displayName })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAccount(data);
      }
    } catch (e) {
      setError('Lỗi tạo tài khoản.');
    }
    setLoading(false);
  };

  return (
    <div className="login-form mt-4">
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Số điện thoại:</label>
          <input
            type="text"
            className="form-control"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            maxLength={11}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Tên hiển thị:</label>
          <input
            type="text"
            className="form-control"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onBlur={handleCheckUsername}
            placeholder="Nhập tên hiển thị"
          />
        </div>
        {checking && <div className="mb-2 text-primary">Đang kiểm tra tên...</div>}
        {error && <div className="mb-2 text-danger">{error}</div>}
        {suggestion && (
          <div className="mb-2">
            Gợi ý tên:{" "}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setDisplayName(suggestion)}
            >
              {suggestion}
            </button>
          </div>
        )}
        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập / Tạo tài khoản"}
        </button>
      </form>
      {account && (
        <div className="alert alert-success mt-4 balance-popup">
          <h5>Chào mừng, {account.displayName}!</h5>
          <p>Số dư ban đầu: <strong>{account.balance} VND</strong></p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
