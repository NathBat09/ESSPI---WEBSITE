import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const db = getFirestore();
  const auth = getAuth();

  // Load projects and user info on component mount
  useEffect(() => {
    fetchProjects();
    fetchUserName();
    logIdToken(); // Logs ID token for API testing/debugging
  }, []);

  // Fetch Firebase ID token
  const logIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const idToken = await user.getIdToken();
        console.log("Firebase ID Token:", idToken);
      } catch (error) {
        console.error("Error fetching ID token:", error);
      }
    } else {
      console.error("User is not authenticated.");
    }
  };

  // Fetch the authenticated user's name
  const fetchUserName = async () => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || user.email);
    }
  };

  // Fetch projects belonging to the current user
  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }

      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error.message);
    }
  };

  // Handle project deletion
  const handleDelete = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(projects.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error.message);
    }
  };

  // Handle project creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }
  
      const newProject = {
        projectName,
        budget: parseFloat(budget),
        userId: user.uid, // This must match Firestore rules
        createdAt: new Date().toISOString(),
      };
  
      console.log("Adding project with data:", newProject);
  
      const docRef = await addDoc(collection(db, "projects"), newProject);
      console.log("Project added successfully:", docRef.id);
  
      setProjects([...projects, { id: docRef.id, ...newProject }]);
      setProjectName("");
      setBudget("");
    } catch (error) {
      console.error("Error adding project:", error.message, error.code);
    }
  };
  
  return (
    <div className="projects-container">
      <div className="header">
        <h1>Welcome {name}</h1>
      </div>
      <div className="form-container">
        <h2>Projects</h2>
        <p>Create and manage your projects below:</p>
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
          projects.map((project) => (
            <div key={project.id} className="project-card">
              <Link to={`/projects/${project.id}/dashboard`} className="project-link">
                <button className="project-btn">
                  <span className="project-name">{project.projectName}</span>
                </button>
              </Link>
              <p>Budget: ${project.budget}</p>
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
