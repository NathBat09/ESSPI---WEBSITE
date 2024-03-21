import React, { Fragment, useState, useEffect } from 'react';
import './App.css';
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Navbar from './components/Navbar'; 
import About from './components/About'; 
import Contact from './components/Contact'; 


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/authentication/verify", {
        method: "POST",
        headers: { "jwt_token": localStorage.jwtToken },
      });
  
      const parseRes = await response.json();
  
      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
  
    } catch (err) {
      console.error(err.message);
    }
  }
  

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <Fragment>
      <Router>
        <Navbar />
        <ToastContainer />
        <div className="container">
          <Switch>
            
            <Route exact path="/contact" component={Contact} />
            <Route exact path="/about" component={About} />
            <Route exact path="/" render={props => <Home {...props} setAuth={setAuth} />} />
            <Route exact path="/login" render={props => !isAuthenticated ? (<Login {...props} setAuth={setAuth} />) : (<Redirect to="/dashboard" />)} />
            <Route exact path="/register" render={props => !isAuthenticated ? (<Register {...props} setAuth={setAuth} />) : (<Redirect to="/login" />)} />
            <Route exact path="/dashboard" render={props => isAuthenticated ? (<Dashboard {...props} setAuth={setAuth} />) : (<Redirect to="/login" />)} />
          </Switch>
        </div>
      </Router>
    </Fragment>
  );
}

export default App;
