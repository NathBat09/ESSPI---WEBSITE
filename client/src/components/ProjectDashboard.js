import React, { useState, useEffect } from "react";
import CalculationModal from "./AddNewCalculationForm.js";
import BarCharts from "./BarCharts.js";
import Modal from "./modal.js";
import CalculationComponent from "./ESSPI_Calculator.js";
import "./global.css";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ProjectDashboard = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [showModal, setShowModal] = useState(true); // Introductory modal
  const [pvSystemData, setPVSystemData] = useState({
    duration: "",
    peaksunhours: "",
    batterytype: "",
  });
  const [newCalculation, setNewCalculation] = useState({
    max_critical_recovery_time: "",
    complete_recovery_time: "",
    power_consumption: "",
    name: "",
    category: "",
    ampere: "",
    volts: "",
    quantity: "",
  });
  const [batterySize, setBatterySize] = useState({});
  const [pvSystemSize, setPVSystemSize] = useState({});
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");

  const db = getFirestore();
  const auth = getAuth();

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          setProject({ id: projectDoc.id, ...data });
          setProjectName(data.projectName);
          setBudget(data.budget);
        }
      } catch (error) {
        console.error("Error fetching project details:", error.message);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Real-Time Listener for Calculations
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const uid = user.uid;
    const q = query(
      collection(db, "calculations"),
      where("projectId", "==", projectId),
      where("projectUserId", "==", uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedCalculations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalculations(fetchedCalculations);
      recalculateIndexes(fetchedCalculations); // Recalculate indexes dynamically
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [projectId]);

  const recalculateIndexes = async (fetchedCalculations) => {
    const VLE = calculateVLE(fetchedCalculations);
    const SLE = calculateSLE(fetchedCalculations);

    for (const calculation of fetchedCalculations) {
      let stesspi = 0;
      let mtesspi = 0;

      if (calculation.category === "EL" || calculation.category === "CL") {
        stesspi = calculateSTESSPI(calculation, VLE).toFixed(2);
      }

      if (calculation.category === "NEL" || calculation.category === "DL") {
        mtesspi = calculateMTESSPI(calculation, VLE, SLE).toFixed(2);
      }

      try {
        await updateDoc(doc(db, "calculations", calculation.id), {
          stesspi: parseFloat(stesspi),
          mtesspi: parseFloat(mtesspi),
        });
      } catch (error) {
        console.error(
          `Error updating STESSPI and MTESSPI for ${calculation.name}:`,
          error.message
        );
      }
    }
  };

  const handleAddCalculation = async (calculation) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const updatedCalculation = {
        ...calculation,
        power_consumption: calculation.power_consumption || calculation.ampere * calculation.volts,
        projectId,
        projectUserId: user.uid,
      };

      await addDoc(collection(db, "calculations"), updatedCalculation);
    } catch (error) {
      console.error("Error adding calculation:", error.message);
    }
  };

  const calculateVLE = (calcs) =>
    calcs.reduce(
      (total, calc) =>
        total + (calc.category === "CL" || calc.category === "EL" ? calc.power_consumption : 0),
      0
    );

  const calculateSLE = (calcs) =>
    calcs.reduce(
      (total, calc) =>
        total + (calc.category === "DL" || calc.category === "NEL" ? calc.power_consumption : 0),
      0
    );

  const calculateSTESSPI = (calc, VLE) => {
    const power =
      calc.power_consumption === 0 && calc.ampere > 0 && calc.volts > 0
        ? calc.ampere * calc.volts
        : calc.power_consumption;

    if (calc.max_critical_recovery_time > 0 && VLE > 0) {
      return (power / VLE) * (calc.complete_recovery_time / calc.max_critical_recovery_time);
    }
    return 0;
  };

  const calculateMTESSPI = (calc, VLE, SLE) => {
    const power =
      calc.power_consumption === 0 && calc.ampere > 0 && calc.volts > 0
        ? calc.ampere * calc.volts
        : calc.power_consumption;

    if (calc.max_critical_recovery_time > 0 && VLE + SLE > 0) {
      return (power / (VLE + SLE)) * (calc.complete_recovery_time / calc.max_critical_recovery_time);
    }
    return 0;
  };

  return (
    <div className="first-div">
      {showModal && (
        <Modal isOpen={showModal} setIsOpen={setShowModal}>
          <img src="/images/ESSPI.png" alt="ESSPI" style={{ width: "100%" }} />
        </Modal>
      )}
      {project && (
        <div className="project-info-container">
          <div className="project-info">
            <h2 className="project-title">{project.projectName} Dashboard</h2>
            <h3 className="project-budget">Budget: ${budget}</h3>
          </div>
        </div>
      )}
      <button className="toggle-button" onClick={() => setShowCalculationModal(true)}>
        Add Calculation
      </button>
      {showCalculationModal && (
        <Modal isOpen={showCalculationModal} setIsOpen={setShowCalculationModal}>
          <CalculationModal
            newCalculation={newCalculation}
            handleInputChange={(e) =>
              setNewCalculation({ ...newCalculation, [e.target.name]: e.target.value })
            }
            handleSubmit={(e) => {
              e.preventDefault();
              handleAddCalculation(newCalculation);
            }}
          />
        </Modal>
      )}
      <CalculationComponent projectId={projectId} calculations={calculations} />
      <BarCharts calculations={calculations} />
    </div>
  );
};

export default ProjectDashboard;
