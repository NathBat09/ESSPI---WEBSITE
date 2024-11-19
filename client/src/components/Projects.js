import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [name, setName] = useState('');
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchProjects();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || user.email);
    }
  };

  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newProject = {
        projectName,
        budget: parseFloat(budget),
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "projects"), newProject);
      setProjects([...projects, { id: docRef.id, ...newProject }]);
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
      <div className="project-buttons-container">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <Link to={`/projects/${project.id}/dashboard`} className="project-link">
                <button className="project-btn">
                  <span className="project-name">{project.projectName}</span>
                </button>
              </Link>
              <br />
              <span>Budget: ${project.budget}</span>
              <br />
              <button onClick={() => handleDelete(project.id)} className="delete-project-btn">
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
