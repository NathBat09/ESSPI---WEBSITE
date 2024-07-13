import React, { useState, useEffect } from 'react';
import CalculationComponent from './ESSPI_Calculator.js';
import { toast } from 'react-toastify';
import CalculationModal from './AddNewCalculationForm.js';
import BarCharts from './BarCharts.js';
import './global.css';
import Modal from './modal';
import STESSPIImage from '../images/ESSPI.png';
import { useHistory } from 'react-router-dom';
import Navbar from './Navbar.js';
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 for generating unique IDs


const ProjectDashboard = ({ projectId, setAuth }) => {
    const history = useHistory();
    const [name, setName] = useState('');
    const [calculations, setCalculations] = useState([]);
    const [showCalculationModal, setShowCalculationModal] = useState(true); 
    const [newCalculation, setNewCalculation] = useState({
        max_critical_recovery_time: '',
        complete_recovery_time: '',
        power_consumption: '',
        element_name: '',
        category: '',
        ampere: '',
        volts: '',
        name: '',
        quantity: '',
    });
    const [pvSystemData, setPVSystemData] = useState({
        duration: '',
        peaksunhours: '',
        batterytype: '',
    });
    const [batterySize, setBatterySize] = useState({});
    const [pvSystemSize, setPVSystemSize] = useState({});
    const [showModal, setShowModal] = useState(true);
    const [showCalculator, setShowCalculator] = useState(false);
    const [pvSystemError, setPVSystemError] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [budget, setBudget] = useState('');
    const [projects, setProjects] = useState([]);

    const calculatePercentageDifference = (budget, cost) => {
        return ((cost / budget) * 100).toFixed(2);
    };
  
    const toggleCalculatorModal = () => {
        setShowCalculator(prevState => !prevState);
    };

    const calculateVLE = (calculations) => {
        let CLE = 0; 
        let ELE = 0; 
    
        for (const calculation of calculations) {
            if (calculation.category === "CL") {
                CLE += calculation.power_consumption;
            } else if (calculation.category === "EL") {
                ELE += calculation.power_consumption;
            }
        }
    
        return CLE + ELE;
    };
    
    const calculateSLE = (calculations) => {
        let DLE = 0; 
        let NELE = 0; 
    
        for (const calculation of calculations) {
            if (calculation.category === "DL") {
                DLE += calculation.power_consumption;
            } else if (calculation.category === "NEL") {
                NELE += calculation.power_consumption;
            }
        }
    
        return DLE + NELE;
    };
    
    const calculateSTESSPI = (calculation, VLE) => {
        let power = calculation.power_consumption;
        if (calculation.power_consumption === 0 && calculation.ampere > 0 && calculation.volts > 0) {
        power = calculation.ampere * calculation.volts;
        }
    
        if (
        (calculation.max_critical_recovery_time > 0 && VLE > 0) &&
        (calculation.category === "CL" || calculation.category === "EL")
        ) {
            
        return (
            (power / VLE) *
            (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
        );
        }
        return 0;
    };
    
    const calculateMTESSPI = (calculation, VLE, SLE) => {
        let power = calculation.power_consumption;
        if (calculation.power_consumption === 0 && calculation.ampere > 0 && calculation.volts > 0) {
            power = calculation.ampere * calculation.volts;
        }
      
        if (
            (calculation.max_critical_recovery_time > 0 && SLE > 0) &&
            (calculation.category === "DL" || calculation.category === "NEL")
        ) {
            return (
                (power / (VLE + SLE)) *
                (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
            );
        }
        return 0;
    };

    useEffect(() => {
        fetchUserName();
        fetchCalculations();
        fetchPVSystemData();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
          try {
            const response = await fetch("http://localhost:5000/projects", {
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
      }, []);
    
      useEffect(() => {
        const project = projects.find(project => project.project_id === projectId);
        if (project) {
          setProjectName(project.project_name);
          setBudget(project.budget);
        }
      }, [projects, projectId]);

    const fetchUserName = async () => {
        try {
            const response = await fetch("http://localhost:5000/dashboard/", {
                method: "POST",
                headers: { jwt_token: localStorage.token }
            });

            const parseRes = await response.json();
            setName(parseRes.user_name);
        } catch (err) {
            console.error(err.message);
        }
    };

    const fetchCalculations = async () => {
        try {
            const response = await fetch(`http://localhost:5000/projects/${projectId}/calculations`, {
                method: "GET",
                headers: { jwt_token: localStorage.token }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const calculationsData = await response.json();
            setCalculations(calculationsData);
        } catch (error) {
            console.error("Error fetching calculations:", error.message);
        }
    };

    const fetchPVSystemData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/projects/${projectId}/pvsystems`, {
                method: "GET",
                headers: { jwt_token: localStorage.token }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const pvSystemData = await response.json();
            setPVSystemData(pvSystemData);
        } catch (error) {
            console.error("Error fetching PV system data:", error.message);
        }
    };

    const closeCalculationModal = () => {
        setShowCalculationModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed - Name: ${name}, Value: ${value}`);
        setNewCalculation((prevCalculation) => ({
            ...prevCalculation,
            [name]: value,
        }));
    };

    const minimumE = () => {
        let CLE = 0; 
        for (const calculation of calculations) {
            if (calculation.category === "CL") {
                CLE += calculation.power_consumption; 
            }
        }
        return CLE;
    };

    const handlePVSystemInputChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = name === 'duration' || name === 'peaksunhours' ? parseFloat(value) : value;
        setPVSystemData((prevData) => ({
            ...prevData,
            [name]: parsedValue,
        }));
    };

    const handlePVSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const pvSystemPayload = {
                duration: pvSystemData.duration,
                peaksunhours: pvSystemData.peaksunhours,
                batterytype: pvSystemData.batterytype,
                pvId: uuidv4(), // Generate a unique ID for the PV system
            };
    
            const response = await fetch(`http://localhost:5000/projects/${projectId}/pvsystems`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'jwt_token': localStorage.token,
                },
                body: JSON.stringify(pvSystemPayload), // Send the payload containing all necessary fields
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.message === "PV System added successfully!") {
                toast.success(data.message);
                setPVSystemError(null);
                setPVSystemData({
                    duration: '',
                    peaksunhours: '',
                    batterytype: '',
                });
            }
        } catch (error) {
            console.error("Error adding PV system:", error.message);
            setPVSystemError("Failed to add PV system. Please try again.");
        }
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        let calculatedPowerConsumption = newCalculation.power_consumption;
        if (newCalculation.quantity !== 0) {
            calculatedPowerConsumption *= newCalculation.quantity;
        }

        const updatedCalculation = { ...newCalculation, power_consumption: calculatedPowerConsumption };

        try {
            // Add new calculation
            const response = await fetch(`http://localhost:5000/projects/${projectId}/calculations`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'jwt_token': localStorage.token,
                },
                body: JSON.stringify(updatedCalculation),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Fetch all calculations including the newly added one
            await fetchCalculations();

            // Recalculate stesspi and mtesspi for all calculations
            const VLE = calculateVLE(calculations);
            const SLE = calculateSLE(calculations);

            for (const calculation of calculations) {
                const newSTESSPI = calculateSTESSPI(calculation, VLE).toFixed(2);
                const newMTESSPI = calculateMTESSPI(calculation, VLE, SLE).toFixed(2);
                console.log(newSTESSPI, newMTESSPI)

                // Update the calculation with the new stesspi and mtesspi values
                await fetch(`http://localhost:5000/projects/${projectId}/calculations/${calculation.calculation_id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'jwt_token': localStorage.token,
                    },
                    body: JSON.stringify({ stesspi: newSTESSPI, mtesspi: newMTESSPI }),
                });
            }

            setNewCalculation({
                max_critical_recovery_time: '',
                complete_recovery_time: '',
                power_consumption: '',
                ampere: '',
                volts: '',
                name: '',
                category: '',
                quantity: '',
            });

        } catch (error) {
            console.error("Error adding a new calculation:", error.message);
        }
    };

    const calculateBatterySize = (duration) => {
        let minimum, BS_SHORT, BS_MID;

        if (pvSystemData.batterytype === "lithium") {
            minimum = minimumE(calculations) * duration * 1.2;
            BS_SHORT = calculateVLE(calculations) * duration * 1.2;
            BS_MID = (calculateVLE(calculations) + calculateSLE(calculations)) * duration * 1.2;
        } else if (pvSystemData.batterytype === "lead") {
            minimum = minimumE(calculations) * duration * 1.75;
            BS_SHORT = calculateVLE(calculations) * duration * 1.75;
            BS_MID = (calculateVLE(calculations) + calculateSLE(calculations)) * duration * 1.75;
        }
        const m_cost = minimum * 271;
        const CS_SHORT = BS_SHORT * 271;
        const CS_MID = BS_MID * 271;

        return { minimum, BS_SHORT, BS_MID, m_cost, CS_SHORT, CS_MID};
    };

    const calculatePVSystemSize = (duration) => {
        let minimum, PVSS_SHORT, PVSS_MID;
        
        minimum = minimumE(calculations) / pvSystemData.peaksunhours;
        PVSS_SHORT = calculateVLE(calculations) / pvSystemData.peaksunhours;
        PVSS_MID = (calculateVLE(calculations) + calculateSLE(calculations)) / pvSystemData.peaksunhours;

        const PV_min = minimum * 0.75 * 1000;
        const PVSC_SHORT = PVSS_SHORT * 0.75*1000;
        const PVSC_MID = PVSS_MID * 0.75*1000;

        return { minimum, PVSS_SHORT, PVSS_MID, PV_min, PVSC_SHORT, PVSC_MID};
    };

    useEffect(() => {
        if (pvSystemData.duration && pvSystemData.peaksunhours && pvSystemData.batterytype) {
            const batterySize = calculateBatterySize(pvSystemData.duration);
            const pvSystemSize = calculatePVSystemSize(pvSystemData.duration);
            setBatterySize(batterySize);
            setPVSystemSize(pvSystemSize);
        }
    }, [pvSystemData, calculations]);

    return (
        <div className="first-div">
            {showModal && (
                <Modal isOpen={showModal} setIsOpen={setShowModal}>
                    <img src={STESSPIImage} alt="ESSPI" style={{ width: '1000px', height: 'auto' }}/>  
                    <br/>      
                </Modal>
            )}
            <div className="project-info-container">
                <div className="project-info">
                    <h2 className="project-title">{projectName} Dashboard</h2>
                    <h3 className="project-budget">Budget: ${budget}</h3>
                </div>
            </div>
            <div className="toggle-button-container">
                <button className="toggle-button" onClick={toggleCalculatorModal}>Calculator Button</button>
            </div>
    
            <Modal isOpen={showCalculator} setIsOpen={setShowCalculator}>
                <CalculationModal
                    show={showCalculationModal}
                    onClose={closeCalculationModal}
                    newCalculation={newCalculation}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                />
            </Modal>
            
            <br/>
            {calculations.length > 0 ? (
                <>
                    <br/>
                    <BarCharts calculations={calculations} />
                    <br/>
                    <CalculationComponent calculations={calculations} projectId={projectId} />
                    <br/>
                    <h2>PV Systems and cost analysis</h2>
                    <form className="form-container" onSubmit={handlePVSubmit}>
                        <label>
                            Duration (hr):
                            <input type="number" name="duration" value={pvSystemData.duration} onChange={handlePVSystemInputChange} />
                        </label>
                        <label>
                            Peak Sun Hours:
                            <input type="number" name="peaksunhours" value={pvSystemData.peaksunhours} onChange={handlePVSystemInputChange} />
                        </label>
                        <label>
                            Battery Type:
                            <select name="batterytype" value={pvSystemData.batterytype} onChange={handlePVSystemInputChange}>
                                <option value="">Select Battery Type</option>
                                <option value="lead">Lead</option>
                                <option value="lithium">Lithium</option>
                            </select>
                        </label>
                        <input type="submit" value="Submit PV System Data" />
                    </form>
                    <br/>
                    <div className="calculated-values-container">
                        <h2>Battery Size</h2>
                        <div className="value-group">
                            <p>Minimum: {batterySize.minimum} kWh</p>
                            <p>Short Term: {batterySize.BS_SHORT} kWh</p>
                            <p>Mid Term: {batterySize.BS_MID} kWh</p>
                        </div>
                        <h2>Battery Cost</h2>
                        <div className="value-group">
                            <p>Minimum: ${batterySize.m_cost}</p>
                            <p>Short Term: ${batterySize.CS_SHORT}</p>
                            <p>Mid Term: ${batterySize.CS_MID}</p>
                        </div>
                    </div>
    
                    <div className="calculated-values-container">
                        <h2>PV System Size</h2>
                        <div className="value-group">
                            <p>Minimum: {pvSystemSize.minimum} kW</p>
                            <p>Short Term: {pvSystemSize.PVSS_SHORT} kW</p>
                            <p>Mid Term: {pvSystemSize.PVSS_MID} kW</p>
                        </div>
                        <h2>PV System Cost</h2>
                        <div className="value-group">
                            <p>Minimum: ${pvSystemSize.PV_min}</p>
                            <p>Short Term: ${pvSystemSize.PVSC_SHORT}</p>
                            <p>Mid Term: ${pvSystemSize.PVSC_MID}</p>
                        </div>
                    </div>
    
                    {/* Progress bars for comparing budget with costs */}
                    <div className="progress-bars-container">
                        <h2>Progress Bars</h2>
                        <div className="progress-bar">
                        <span>  Minimum Battery Cost</span>
                        <div className="progress">
                            <div 
                            className="progress-fill" 
                            style={{ width: `${calculatePercentageDifference(budget, batterySize.m_cost)}%`, backgroundColor: calculatePercentageDifference(budget, batterySize.m_cost) >= 50 ? 'blue' : 'red' }}
                            ></div>
                        </div>
                        <span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{calculatePercentageDifference(budget, batterySize.m_cost)}%</span>
                        </div>
                        <div className="progress-bar">
                        <span className="see">  Short Term Battery Cost</span>
                        <div className="progress">
                            <div 
                            className="progress-fill" 
                            style={{ width: `${calculatePercentageDifference(budget, batterySize.CS_SHORT)}%`, backgroundColor: calculatePercentageDifference(budget, batterySize.CS_SHORT) >= 50 ? 'blue' : 'red' }}
                            ></div>
                        </div>
                        <span className="see">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{calculatePercentageDifference(budget, batterySize.CS_SHORT)}%</span>
                        </div>
                        <div className="progress-bar">
                        <span>  Mid Term Battery Cost</span>
                        <div className="progress">
                            <div 
                            className="progress-fill" 
                            style={{ width: `${calculatePercentageDifference(budget, batterySize.CS_MID)}%`, backgroundColor: calculatePercentageDifference(budget, batterySize.CS_MID) >= 50 ? 'blue' : 'red' }}
                            ></div>
                        </div>
                        <span className="see">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{calculatePercentageDifference(budget, batterySize.CS_MID)}%</span>
                        </div>
                        <div className="progress-bar">
                        <span>  Minimum PV System Cost</span>
                        <div className="progress">
                            <div 
                            className="progress-fill" 
                            style={{ width: `${calculatePercentageDifference(budget, pvSystemSize.PV_min)}%`, backgroundColor: calculatePercentageDifference(budget, pvSystemSize.PV_min) >= 50 ? 'blue' : 'red' }}
                            ></div>
                        </div>
                        <span>{calculatePercentageDifference(budget, pvSystemSize.PV_min)}%</span>
                        </div>
                        <div className="progress-bar">
                        <span>  Short Term PV System Cost</span>
                        <div className="progress">
                            <div 
                            className="progress-fill" 
                            style={{ width: `${calculatePercentageDifference(budget, pvSystemSize.PVSC_SHORT)}%`, backgroundColor: calculatePercentageDifference(budget, pvSystemSize.PVSC_SHORT) >= 50 ? 'blue' : 'red' }}
                            ></div>
                        </div>
                        <span>{calculatePercentageDifference(budget, pvSystemSize.PVSC_SHORT)}%</span>
                        </div>
                        <div className="progress-bar">
                        <span>  Mid Term PV System Cost</span>
                        <div className="progress">
                            <div 
                            className="progress-fill" 
                            style={{ width: `${calculatePercentageDifference(budget, pvSystemSize.PVSC_MID)}%`, backgroundColor: calculatePercentageDifference(budget, pvSystemSize.PVSC_MID) >= 50 ? 'blue' : 'red' }}
                            ></div>
                        </div>
                        <span>{calculatePercentageDifference(budget, pvSystemSize.PVSC_MID)}%</span>
                        </div>
                    </div>
                </>
            ) : (
                <p>Waiting for the elements...</p>
            )}
        </div>
    );
};

export default ProjectDashboard;
