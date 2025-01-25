import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';

const Register = ({ setAuth }) => {
  const [inputs, setInputs] = useState({ email: '', password: '', name: '' });
  const { email, password, name } = inputs;

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      setAuth(true);
      toast.success("Registered successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="form-container d-flex justify-content-center align-items-center vh-100">
      <div className="form-card">
        <h2 className="text-center mb-4">Register</h2>
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
          <div className="form-group mb-3">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={onChange}
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login" className="text-link">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
