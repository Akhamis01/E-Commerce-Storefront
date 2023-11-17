import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verification-Pending.css';

const VerificationPending = () => {

    return (
        <div className="verification-body">
            <div className="verification-form" style={{ display: 'block' }}>
                <h1>Email Verification</h1>
                <p>An email has been successfully sent for Verification. Please Verify, then you can now log in.</p>
                <a className="btn btn-primary btn-rounded" href="/login">Back to Login</a>
            </div>
        </div>
    );
};

export default VerificationPending;