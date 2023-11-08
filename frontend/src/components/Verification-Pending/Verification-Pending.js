import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import './Verification-Pending.css';

const VerificationPending = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    useEffect(() => {
        $(window).on('load', function () {
            setTimeout(function () {
                $('.verification-form').fadeIn('slow');
            }, 750);
        });
    }, []);

    return (
        <div className="verification-body">
            <div className="verification-form" style={{ display: 'none' }}>
                <h1>Email Verification</h1>
                <p>An email has been successfully sent for Verification. Please Verify, then you can now log in.</p>
                <button onClick={handleLoginClick}>Back to Login</button>
            </div>
        </div>
    );
};

export default VerificationPending;