import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import './Login.css';

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({ email: '', password: '' });
  const { email, password } = inputs;

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuth(true);
      toast.success("Logged in successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={onSubmitForm}>
        <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required />
        <button type="submit">Login</button>
      </form>
      <Link to="/register">Register</Link>
    </div>
  );
};

export default Login;
