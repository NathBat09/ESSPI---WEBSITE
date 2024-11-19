import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import './Register.css';

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
    <div className="register-wrapper">
      <form onSubmit={onSubmitForm}>
        <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required />
        <input type="text" name="name" placeholder="Name" value={name} onChange={onChange} required />
        <button type="submit">Register</button>
      </form>
      <Link to="/login">Login</Link>
    </div>
  );
};

export default Register;
