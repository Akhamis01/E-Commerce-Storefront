import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.css';


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const history = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        fetch("/login", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({username: username, password: password})
        }).then(res => res.json()).then(res => {
            if(res['alert'] !== 'error'){
                history.push("/home");
            } else{
                setError(true);
            }
        });
    };



    const TestSubmit = (e) => {
        console.log('done')
        fetch("/home", {
            method:"GET",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
        })
    };


    return (
        <div className="login-body">
            <div className="login-form">
                <form onSubmit={handleSubmit} className="container" action="/main" method="get">
                    <h1>Login</h1>
                        
                    <div className="form-group">
                        <label htmlFor="username"><b>Username</b></label>
                        <input type="text" placeholder="Enter Username" name="username" className="form-control" onChange={ (event) => setUsername(event.target.value) } required autoFocus/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Password</b></label>
                        <input type="password" placeholder="Enter Password" name="password" className="form-control" onChange={ (event) => setPassword(event.target.value) } required/>
                    </div>

                    {
                        (username && password) ? (
                            <button className="btn btn-primary btn-rounded" type="submit">Login</button>
                        ) : (
                            <button className="btn btn-primary btn-rounded" type="submit" disabled>Login</button>
                        )
                    }

                    <hr/>
                    <a className="btn btn-primary btn-rounded" type="submit" href="/registration">Register here!</a>
                    {
                        (error) ? (
                            <p style={{color:"red"}}>Incorrect username and/or password. Please try again</p>
                        ) : null
                    }
                </form>
            </div>
            <a href="#" onClick={TestSubmit} type="button" className="btn btn-primary me-3">TEST BUTTON</a>
        </div>

    );
};

export default Login;