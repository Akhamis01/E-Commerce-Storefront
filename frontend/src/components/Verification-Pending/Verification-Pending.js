import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verification-Pending.css';

const VerificationPending = () => {

    return (
        <div className="order-main-bg">
            <div className="verification-body">
                <div className="verification-form" style={{width: 1000, }}>
                    <h1  id="verification-top" style={{ color: 'white' }}>Verification Pending</h1>
                    <p style={{ color: 'white' }}>A message has been sent to the email you provided. <br></br>
                    Please follow the instructions to complete verification, then try logging in again.</p>
                    <a id="logins-btn" className="btn btn-primary btn-rounded" href="/login">Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default VerificationPending;