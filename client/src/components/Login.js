import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';

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
    <div className="form-container d-flex justify-content-center align-items-center vh-100">
      <div className="form-card">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={onSubmitForm}>
          <div className="form-group mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={onChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={onChange}
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/register" className="text-link">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
