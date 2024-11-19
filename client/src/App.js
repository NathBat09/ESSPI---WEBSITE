import React, { Fragment, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "./firebase"; // Import your Firebase app initialization
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
import ProjectDashboard from './components/ProjectDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth(firebaseApp); // Pass the initialized Firebase app
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe; // Cleanup listener on unmount
  }, []);

  return (
    <Fragment>
      <Router>
        <Navbar showLogoutButton={isAuthenticated} setAuth={setIsAuthenticated} />
        <ToastContainer />
        <div className="container">
          <Switch>
            <Route exact path="/Research" component={ResearchPage} />
            <Route exact path="/contact" component={Contact} />
            <Route exact path="/about" component={About} />
            <Route exact path="/" render={(props) => <Home {...props} setAuth={setIsAuthenticated} />} />
            <Route exact path="/login" render={(props) => isAuthenticated ? (<Redirect to="/projects" />) : (<Login {...props} setAuth={setIsAuthenticated} />)} />
            <Route exact path="/register" render={(props) => !isAuthenticated ? (<Register {...props} setAuth={setIsAuthenticated} />) : (<Redirect to="/login" />)} />
            <Route exact path="/projects" render={(props) => isAuthenticated ? (<Projects {...props} />) : (<Redirect to="/login" />)} />
            <Route exact path="/projects/:projectId/dashboard" render={(props) => isAuthenticated ? (<ProjectDashboard projectId={props.match.params.projectId} setAuth={setIsAuthenticated} />) : (<Redirect to="/login" />)} />
          </Switch>
        </div>
      </Router>
    </Fragment>
  );
}

export default App;
