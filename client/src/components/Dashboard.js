import React, { useState, useEffect } from 'react';
import CalculationComponent from './ESSPI_Calculator.js';
import { toast } from 'react-toastify';
import CalculationModal from './AddNewCalculationForm.js';
import BarCharts from './BarCharts.js';
import './global.css';
import Modal from './modal';
import STESSPIImage from '../images/ESSPI.png';


const Dashboard = ({ setAuth }) => {
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

  
    const fetchCalculations = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/calculations", {
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

    useEffect(() => {
        fetchUserName();
        fetchCalculations();
    }, []);

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
  
    const closeCalculationModal = () => {
        setShowCalculationModal(false);
    };
  
    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("Token");
        setAuth(false);
        toast.success("Logged out successfully");
    };
  
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed - Name: ${name}, Value: ${value}`);
        setNewCalculation((prevCalculation) => ({
            ...prevCalculation,
            [name]: value,
        }));
    };

    const handlePVSystemInputChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = name === 'duration' || name === 'peaksunhours' ? parseFloat(value) : value;
        setPVSystemData((prevData) => ({
            ...prevData,
            [name]: parsedValue,
        }));
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Add new calculation
            const response = await fetch("http://localhost:5000/api/calculations", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'jwt_token': localStorage.token,
                },
                body: JSON.stringify(newCalculation),
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
                await fetch(`http://localhost:5000/api/calculations/${calculation.calculation_id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'jwt_token': localStorage.token,
                    },
                    body: JSON.stringify({ stesspi: newSTESSPI, mtesspi: newMTESSPI }),
                });
            }

        } catch (error) {
            console.error("Error adding a new calculation:", error.message);
        }
    };
  
    const calculateBatterySize = (duration) => {
        let BS_SHORT, BS_MID;

        if (pvSystemData.batterytype === "lithium") {
            BS_SHORT = calculateVLE(calculations) * duration * 1.2;
            BS_MID = (calculateVLE(calculations) + calculateSLE(calculations)) * duration * 1.2;
        } else if (pvSystemData.batterytype === "lead") {
            BS_SHORT = calculateVLE(calculations) * duration * 1.75;
            BS_MID = (calculateVLE(calculations) + calculateSLE(calculations)) * duration * 1.75;
        }
        const CS_SHORT = BS_SHORT * 271;
        const CS_MID = BS_MID * 271;

        return { BS_SHORT, BS_MID, CS_SHORT, CS_MID};
    };

    const calculatePVSystemSize = (duration) => {
        let PVSS_SHORT, PVSS_MID;

        PVSS_SHORT = calculateVLE(calculations) / pvSystemData.peaksunhours;
        PVSS_MID = (calculateVLE(calculations) + calculateSLE(calculations)) / pvSystemData.peaksunhours;

        const PVSC_SHORT = PVSS_SHORT * 0.75;
        const PVSC_MID = PVSS_MID * 0.75;

        return { PVSS_SHORT, PVSS_MID, PVSC_SHORT, PVSC_MID};
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
        <div className="container">
            {showModal && ( // Conditionally render the modal based on the state
                <Modal isOpen={showModal} setIsOpen={setShowModal}>
                    <img src={STESSPIImage} alt="ESSPI" style={{ width: '1000px', height: 'auto' }}/>  
                    <br/>      
                </Modal>
            )}
            <h1 className="App-title">Welcome {name}</h1>
            <div className="logout-container">
                <button className="btn btn-primary logout-button" onClick={(e) => logout(e)}>
                     Logout
                </button>
            </div>

            <button onClick={toggleCalculatorModal}>
                Toggle Calculator Modal
            </button>
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
                    <CalculationComponent calculations={calculations} />
                    <br/>
                    <h2>PV Systems and cost analysis</h2>
                    <form className="form-container" onSubmit={handleSubmit}>
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
                          <p>Short Term: {batterySize.BS_SHORT} kWh</p>
                          <p>Mid Term: {batterySize.BS_MID} kWh</p>
                      </div>
                      <h2>Battery Cost</h2>
                      <div className="value-group">
                          <p>Short Term: ${batterySize.CS_SHORT}</p>
                          <p>Mid Term: ${batterySize.CS_MID}</p>
                      </div>
                  </div>

                  <div className="calculated-values-container">
                      <h2>PV System Size</h2>
                      <div className="value-group">
                          <p>Short Term: {pvSystemSize.PVSS_SHORT} kW</p>
                          <p>Mid Term: {pvSystemSize.PVSS_MID} kW</p>
                      </div>
                      <h2>PV System Cost</h2>
                      <div className="value-group">
                          <p>Short Term: ${pvSystemSize.PVSC_SHORT}</p>
                          <p>Mid Term: ${pvSystemSize.PVSC_MID}</p>
                      </div>
                  </div>
                  <br />
                </>
            ) : (
                <p>Waiting for the elements...</p>
            )}
        </div>
    );
};

export default Dashboard;
