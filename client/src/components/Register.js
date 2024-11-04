import React, { Fragment, useState } from 'react';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import './Register.css'


const Register = ({setAuth}) => {

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    name: ""
  });

  const {email, password, name} = inputs;

  const onChange = (e) => {
    setInputs({...inputs, [e.target.name] : e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
        const body = { email, password, name };
        const response = await fetch("https://serverside-79597717194.us-central1.run.app/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const parseRes = await response.json().catch(() => null);
        if (parseRes && parseRes.jwtToken) {
            localStorage.setItem("token", parseRes.jwtToken);
            setAuth(true);
            toast.success("Registered Successfully");
        } else {
            setAuth(false);
            toast.error(parseRes ? parseRes.msg : "An unexpected error occurred");
        }
    } catch (err) {
        console.error("Registration Error:", err.message);
    }
};

  

  return (
    <Fragment>
      <div className="register-wrapper">  
        <div className="register-container"> 
          <h1 className="text-center my-5">Register</h1> 
          <form onSubmit ={onSubmitForm}>
            <input type="email" name="email" placeholder="email" className="form-control my-3" value={email} onChange = { e => onChange(e)}></input>
            <input type="password" name="password" placeholder="password" className="form-control my-3" value={password} onChange = { e => onChange(e)}></input>
            <input type="text" name="name" placeholder="name" className="form-control my-3" value={name} onChange = { e => onChange(e)}></input>
            <button className="btn btn-success btn-block">Submit</button>
          </form>
          <Link to="/login" className="link">Login</Link>
        </div>
      </div>
    </Fragment>
  );
};

export default Register;
