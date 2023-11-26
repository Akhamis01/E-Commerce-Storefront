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
    <section className="vh-100 body-reset card-reset lock-icon-reset h2-reset p-reset">
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-9 col-lg-6 col-xl-5">
            {/* Placeholder for image */}
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid"
              alt="Sample image"
            />
          </div>
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <form className="reset-password-form" onSubmit={handleSubmit}>
              {/* Sign in with social buttons */}
              <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                <p className="lead fw-normal mb-0 me-3">Forgot Password?</p>
              </div>

              {/* Divider */}
              <div className="divider d-flex align-items-center my-4">
                <p className="text-center fw-bold mx-3 mb-0"></p>
              </div>

              {/* Reset Token input */}
              <div className="form-outline mb-4">
                <p className="inputTitle">Reset Token</p>
                <input
                  type="text"
                  id="resetToken"
                  value={token}
                  readOnly
                  required
                  className="form-control form-control-lg passInput"
                  placeholder="Reset Token"
                />
              </div>

              {/* New Password input */}
              <div className="form-outline mb-3">
                <p className="inputTitle">New Password</p>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-control form-control-lg passInput"
                  placeholder="New Password"
                />
              </div>

              {/* Confirm Password input */}
              <div className="form-outline mb-3">
                <p className="inputTitle">Confirm Password</p>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control form-control-lg passInput"
                  placeholder="Confirm Password"
                />
              </div>
              {/* Submit button */}
              <div className="text-center text-lg-start mt-4 pt-2">
                <button className = 'button-reset'
                  type="submit"
                  className="btn btn-primary btn-lg btn-reset-password"
                >
                  Reset Password
                </button>
              </div>
              {/* Display success or error message */}
              {resetResult && (
                <div className={`reset-message ${resetResult.alert}`}>
                  {resetResult.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
