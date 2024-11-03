import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Fetch projects from the server
    const fetchProjects = async () => {
      try {
        const response = await fetch("https://serverside-79597717194.us-central1.run.app/projects", {
          method: "GET",
          headers: { jwt_token: localStorage.token }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const projectsData = await response.json();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const response = await fetch("https://serverside-79597717194.us-central1.run.app/dashboard/", {
        method: "POST",
        headers: { jwt_token: localStorage.token }
      });

      const parseRes = await response.json();
      setName(parseRes.user_name);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      const response = await fetch(`https://serverside-79597717194.us-central1.run.app/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'jwt_token': localStorage.token,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update projects state to remove the deleted project
      setProjects(projects.filter(project => project.project_id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://serverside-79597717194.us-central1.run.app/projects", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'jwt_token': localStorage.token,
        },
        body: JSON.stringify({ project_name: projectName, budget: budget }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setProjectName('');
      setBudget('');

    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <div className="projects-container">
      <div className="header">
        <h1>Welcome {name}</h1>
      </div>
      <div className="form-container">
        <h2>Projects</h2>
        <p>Welcome to the Projects page. Below is a list of your projects:</p>
        {/* Project Form */}
        <form onSubmit={handleSubmit} className="project-form">
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
          <button type="submit">Add Project</button>
        </form>
      </div>

      {/* List of Projects as Buttons */}
      <div className="project-buttons-container">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.project_id} className="project-card">
              <Link to={`/projects/${project.project_id}/dashboard`} className="project-link">
                <button className="project-btn">
                  <span className="project-name">{project.project_name}</span>
                </button>
              </Link>
              <br/>
              <span>Budget: ${project.budget}</span>
              <br/>
              <br/>
              <button onClick={() => handleDelete(project.project_id)} className="delete-project-btn">
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No projects available.</p>
        )}
      </div>
    </div>
  );
};

export default Projects;
