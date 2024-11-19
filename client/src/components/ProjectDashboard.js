import React, { useState, useEffect } from 'react';
import CalculationModal from './AddNewCalculationForm.js';
import BarCharts from './BarCharts.js';
import Modal from './modal.js';
import './global.css';
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ProjectDashboard = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [pvSystemData, setPVSystemData] = useState({
    duration: '',
    peaksunhours: '',
    batterytype: '',
  });
  const [newCalculation, setNewCalculation] = useState({
    max_critical_recovery_time: '',
    complete_recovery_time: '',
    power_consumption: '',
    name: '',
    category: '',
    ampere: '',
    volts: '',
    quantity: '',
  });
  const [batterySize, setBatterySize] = useState({});
  const [pvSystemSize, setPVSystemSize] = useState({});
  const db = getFirestore();

  useEffect(() => {
    fetchProjectDetails();
    fetchCalculations();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const fetchCalculations = async () => {
    try {
      const q = query(collection(db, "calculations"), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      const fetchedCalculations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalculations(fetchedCalculations);
    } catch (error) {
      console.error("Error fetching calculations:", error);
    }
  };

  const handleAddCalculation = async (calculation) => {
    try {
      const updatedCalculation = {
        ...calculation,
        power_consumption: calculation.power_consumption || calculation.ampere * calculation.volts,
        projectId,
      };

      await addDoc(collection(db, "calculations"), updatedCalculation);
      fetchCalculations();
      setShowCalculationModal(false);
    } catch (error) {
      console.error("Error adding calculation:", error);
    }
  };

  const handleDeleteCalculation = async (calculationId) => {
    try {
      await deleteDoc(doc(db, "calculations", calculationId));
      fetchCalculations();
    } catch (error) {
      console.error("Error deleting calculation:", error);
    }
  };

  const handlePVSubmit = async (e) => {
    e.preventDefault();
    try {
      const pvSystemRef = doc(db, "pv_system", projectId);
      await updateDoc(pvSystemRef, { ...pvSystemData, projectId });
      setPVSystemData({ duration: '', peaksunhours: '', batterytype: '' });
    } catch (error) {
      console.error("Error saving PV system data:", error);
    }
  };

  const calculateVLE = () => {
    let CLE = 0, ELE = 0;
    calculations.forEach(calc => {
      if (calc.category === "CL") CLE += calc.power_consumption;
      else if (calc.category === "EL") ELE += calc.power_consumption;
    });
    return CLE + ELE;
  };

  const calculateSLE = () => {
    let DLE = 0, NELE = 0;
    calculations.forEach(calc => {
      if (calc.category === "DL") DLE += calc.power_consumption;
      else if (calc.category === "NEL") NELE += calc.power_consumption;
    });
    return DLE + NELE;
  };

  const calculateBatterySize = () => {
    const VLE = calculateVLE();
    const SLE = calculateSLE();
    const multiplier = pvSystemData.batterytype === "lithium" ? 1.2 : 1.75;

    return {
      minimum: VLE * pvSystemData.duration * multiplier,
      shortTerm: VLE * pvSystemData.duration * multiplier,
      midTerm: (VLE + SLE) * pvSystemData.duration * multiplier,
    };
  };

  useEffect(() => {
    if (pvSystemData.duration && pvSystemData.peaksunhours && pvSystemData.batterytype) {
      const batterySizes = calculateBatterySize();
      setBatterySize(batterySizes);
      setPVSystemSize({
        minimum: calculateVLE() / pvSystemData.peaksunhours,
        shortTerm: calculateSLE() / pvSystemData.peaksunhours,
      });
    }
  }, [pvSystemData, calculations]);

  return (
    <div className="dashboard-container">
      {project && (
        <div className="project-info">
          <h2>{project.projectName} Dashboard</h2>
          <h3>Budget: ${project.budget}</h3>
        </div>
      )}
      <button onClick={() => setShowCalculationModal(true)}>Add Calculation</button>
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
      <BarCharts calculations={calculations} />
      <form onSubmit={handlePVSubmit}>
        <h2>PV System Data</h2>
        <input
          type="number"
          name="duration"
          value={pvSystemData.duration}
          onChange={(e) => setPVSystemData({ ...pvSystemData, [e.target.name]: e.target.value })}
          placeholder="Duration"
        />
        <input
          type="number"
          name="peaksunhours"
          value={pvSystemData.peaksunhours}
          onChange={(e) => setPVSystemData({ ...pvSystemData, [e.target.name]: e.target.value })}
          placeholder="Peak Sun Hours"
        />
        <select
          name="batterytype"
          value={pvSystemData.batterytype}
          onChange={(e) => setPVSystemData({ ...pvSystemData, [e.target.name]: e.target.value })}
        >
          <option value="">Select Battery Type</option>
          <option value="lithium">Lithium</option>
          <option value="lead">Lead</option>
        </select>
        <button type="submit">Save PV System</button>
      </form>
      <div>
        <h2>Calculations</h2>
        {calculations.map((calc) => (
          <div key={calc.id}>
            <p>Name: {calc.name}</p>
            <p>Category: {calc.category}</p>
            <p>Power Consumption: {calc.power_consumption} kW</p>
            <button onClick={() => handleDeleteCalculation(calc.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;
