import React, { Fragment, useState } from 'react';
import { Link } from "react-router-dom"
import { toast } from 'react-toastify';
import './Login.css';

const Login = ({setAuth}) => {

  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  })

  const { email, password } = inputs

  const onChange = e => {
    setInputs({...inputs, [e.target.name] : e.target.value });
  };

  const onSubmitForm = async(e) => {
    e.preventDefault()
    try{

      const body = { email, password};

      const response = await fetch("https://serverside-79597717194.us-central1.run.app/auth/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();

      if(parseRes.jwtToken){
        localStorage.setItem("token", parseRes.jwtToken);
        setAuth(true);
        toast.success("login successfully");
      } else{
        toast.error(parseRes);
      }
    } catch (err){
      console.error(err.message);
    }
  }

  return (
    <Fragment>
      <div className="login-wrapper">
        <div className="login-container">
          <h1 className="text-center">Login</h1>
          <form onSubmit={onSubmitForm}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter email" 
                className="form-control" 
                value={email} 
                onChange={e => onChange(e)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                className="form-control" 
                value={password} 
                onChange={e => onChange(e)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
          <Link to="/register" className="link">Register</Link>
        </div>
      </div>
    </Fragment>
  );
};


export default Login;
