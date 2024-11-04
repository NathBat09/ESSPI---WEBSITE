import React, { Fragment, useState, useEffect } from 'react';
import './App.css';
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Importing components
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Navbar from './components/Navbar'; 
import About from './components/About'; 
import Contact from './components/Contact'; 
import Projects from './components/Projects';
import ResearchPage from './components/Research';
import ProjectDashboard from './components/ProjectDashboard'; // Add this import

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
        const response = await fetch("https://serverside-79597717194.us-central1.run.app/auth/verify", {
            method: "GET",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
  
        const parseRes = await response.json();
        setIsAuthenticated(parseRes === true);
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
        <Navbar showLogoutButton={isAuthenticated} setAuth={setAuth} />
        <ToastContainer />
        <div className="container">
          <Switch>
            <Route exact path="/Research" component={ResearchPage} />
            <Route exact path="/contact" component={Contact} />
            <Route exact path="/about" component={About} />
            <Route exact path="/" render={props => <Home {...props} setAuth={setAuth} />} />
            <Route exact path="/login" render={props => isAuthenticated ? (<Redirect to="/projects" />) : (<Login {...props} setAuth={setAuth} />)} />
            <Route exact path="/register" render={props => !isAuthenticated ? (<Register {...props} setAuth={setAuth} />) : (<Redirect to="/login" />)} />
            <Route exact path="/projects" render={props => isAuthenticated ? (<Projects {...props} />) : (<Redirect to="/login" />)} />
            <Route exact path="/projects/:projectId/dashboard" render={props => isAuthenticated ? (<ProjectDashboard projectId={props.match.params.projectId}  setAuth={setAuth} />) : (<Redirect to="/login" />)} />
          </Switch>
        </div>
      </Router>
    </Fragment>
  );
}

export default App;
