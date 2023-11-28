import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import NavBar from '../NavBar/NavBar'

import './Contact.css';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/getusertype").then(res => res.json()).then(data => {
            setUserType(data['type']);
        });
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        setMessageSent(false);

        if (!name || !email || !message) {
            setError(true);
            return;
        }

        fetch("/contact", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ name, email, message }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.alert === 'success') {
                    setName('');
                    setEmail('');
                    setMessage('');
                    setMessageSent(true);
                } else {
                    setError(true);
                }
            });
    };

    return (
        <div>
            <NavBar userType={userType}/>
            <div className="contact-body">
                <h1>Contact Form</h1>
                <br></br>
                <form className={`contact-form ${messageSent ? 'hidden' : ''}`} onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name"><b>Name</b></label>
                        <input type="text" placeholder="Enter Name" name="name" value={name} onChange={(event) => setName(event.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Email"><b>Email</b></label>
                        <input type="email" placeholder="Enter Email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name"><b>Message</b></label>
                        <textarea type="text" placeholder="Enter Message" name="message" value={message} onChange={(event) => setMessage(event.target.value)} required />
                    </div>

                    <button type="submit">Submit</button>
                </form>
                {error && <p className="error-message">Missing Fields. Please try again.</p>}
                {messageSent && <p className="success-message">Message Sent.</p>}
            </div>
        </div>
    );
};

export default Contact;