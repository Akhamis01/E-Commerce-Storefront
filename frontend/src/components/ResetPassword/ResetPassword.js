import React, { useState, useEffect } from 'react';
import './ResetPassword.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetResult, setResetResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);



  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        setResetResult({ alert: 'error', message: 'Passwords do not match' });
        return;
      }
    fetch("/reset-password", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ resetToken: token, newPassword }),
    })
      .then((res) => res.json())
      .then((res) => {
        setResetResult(res);
      });
  };
  return (
    <div className="reset-password-body">
      <div className="reset-password-container">
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <label htmlFor="resetToken">Reset Token:</label>
          <input
            type="text"
            id="resetToken"
            value={token}
            readOnly
            required
          />

          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Reset Password</button>
        </form>

        {resetResult && (
          <div className={`reset-password-result-message ${resetResult.alert === 'success' ? 'reset-password-success-message' : 'reset-password-error-message'}`}>
            {resetResult.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
