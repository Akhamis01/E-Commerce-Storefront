import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';

import './Registration.css';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const Registration = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passConfirm, setPassConfirm] = useState('');
    const [emailAddress, setEmailAddress] = useState('NULL');
    const [phone, setPhone] = useState(0);
    const [address, setAddress] = useState('NULL');
    const [firstName, setFirstName] = useState('NULL');
    const [lastName, setLastName] = useState('NULL');

    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect( () => {
        $(window).on('load', function(){
            setTimeout(function() {
                $('.login-form').fadeIn('slow');
            }, 750);
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        fetch("/register", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({username: username, password: password, email:emailAddress, phone:phone, address:address, firstName:firstName, lastName:lastName})
        }).then(res => res.json()).then(res => {
            if(res['alert'] === 'success'){
                navigate("/verification-pending");
            } else{
                setError(true);
            }
        })
    };

    return (
        <div className="register-body">
            <LoadingScreen/>
            <div className="login-form" style={{display: "none"}}>
                <form onSubmit={handleSubmit} className="container" action="/home" method="get">
                    <h1>Register</h1>
                    <hr/>

                    <div className="form-group">
                        <label htmlFor="username"><b>Username</b></label>
                        <input id="username-check" type="text" placeholder="Username" name="username" className="form-control" onChange={ (event) => setUsername(event.target.value) } required autoFocus/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Password</b></label>
                        <input id="pass" type="password" placeholder="Password" name="password" className="form-control" onChange={ (event) => setPassword(event.target.value) } required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Confirm Password</b></label>
                        <input id="pass-confirm" type="password" placeholder="Confirm Password" name="confirmation" className="form-control" onChange={ (event) => setPassConfirm(event.target.value) } required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address"><b>Email Address</b></label>
                        <input id="pass-confirm" type="email" placeholder="Email Address" name="confirmation" className="form-control" onChange={ (event) => setEmailAddress(event.target.value) }/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Phone Number</b></label>
                        <input id="pass-confirm" type="number" placeholder="Phone Number" name="confirmation" className="form-control" onChange={ (event) => setPhone(event.target.value) }/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Residential Address</b></label>
                        <input id="pass-confirm" type="text" placeholder="Residential Address" name="confirmation" className="form-control" onChange={ (event) => setAddress(event.target.value) }/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>First Name</b></label>
                        <input id="pass-confirm" type="text" placeholder="First Name" name="confirmation" className="form-control" onChange={ (event) => setFirstName(event.target.value) }/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Last Name</b></label>
                        <input id="pass-confirm" type="text" placeholder="Last Name" name="confirmation" className="form-control" onChange={ (event) => setLastName(event.target.value) }/>
                    </div>

                    {
                        (username && (password === passConfirm) && (password !== "")) ? (
                            <button id="register" className="btn btn-primary btn-rounded" type="submit">Register</button>
                        ) : (
                            <button id="register" className="btn btn-primary btn-rounded" type="submit" disabled>Register</button>
                        )
                    }

                    <hr/>
                    <a className="btn btn-primary btn-rounded" href="/login">Already Registered? Login Here!</a>

                    {
                        (error) ? (
                            <p style={{color:"red"}}>Username already exists, please choose another username.</p>
                        ) : null
                    }
                </form>
            </div>
        </div>

    );
};

export default Registration;