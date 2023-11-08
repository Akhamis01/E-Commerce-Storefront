import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';

import './Contact.css';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const Contact = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        $(window).on('load', function () {
            setTimeout(function () {
                $('.contact-form').fadeIn('slow');
            }, 750);
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        fetch("/contact", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({ name: name, email: email, message: message })
        })
        .then(res => res.json())
        .then(res => {
            if(res['alert'] === 'success'){
                setError(false);
                setName('');
                setEmail('');
                setMessage('');
            } else{
                setError(true);
            }
        });
    };

    // add a reset function
    return (
        <div className="contact-body">
            <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name"><b>Name</b></label>
                        <input type="text" placeholder="Enter Name" name="name" onChange={ (event) => setName(event.target.value) } required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="Email"><b>Email</b></label>
                        <input type="email" placeholder="Enter Email" name="email" onChange={ (event) => setEmail(event.target.value) } required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name"><b>Name</b></label>
                        <input type="text" placeholder="Enter Message" name="message" onChange={ (event) => setMessage(event.target.value) } required/>
                    </div>

                    <button type="submit">Submit</button>
            </form>
            {error && <p style={{ color: "red" }}>Missing Fields. Please try again.</p>}
            {!error && <p style={{ color: "green" }}>Message Sent.</p>}
        </div>
    );
};

export default Contact;