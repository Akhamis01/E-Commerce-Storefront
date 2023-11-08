// Verification.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const Verification = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        fetch("/verify", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ verificationCode: verificationCode })
        })
        .then(res => res.json())
        .then(res => {
            if (res['alert'] === 'success') {
                navigate("/home");
            } else {
                setError(true);
            }
        });
    };

    return (
        <div className="verification-body">
            <LoadingScreen />
            <h1>Verification</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="verificationCode">Enter Verification Code:</label>
                    <input
                        type="text"
                        placeholder="Verification Code"
                        name="verificationCode"
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: "red" }}>Invalid verification code. Please try again.</p>}
                <button type="submit">Verify</button>
            </form>
        </div>
    );
};

export default Verification;