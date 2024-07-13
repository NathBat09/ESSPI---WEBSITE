import React, { useState, useEffect } from 'react';
import './global.css'; 
import Modal from './modal'; 


const CalculationComponent = ({ projectId }) => {
  const [calculations, setCalculations] = useState([]);
  const [selectedCalculation, setSelectedCalculation] = useState(null);

  useEffect(() => {
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

    fetchCalculations();
  }, [calculations]);

  const openModal = (calculation) => {
    setSelectedCalculation(calculation);
  };

  const closeModal = () => {
    setSelectedCalculation(null);
  };

  const handleDelete = async (calculationId) => {
    try {
      const response = await fetch(`http://localhost:5000/projects/${projectId}/calculations/${calculationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          jwt_token: localStorage.token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setCalculations((prevCalculations) =>
        prevCalculations.filter((calculation) => calculation.calculation_id !== calculationId)
      );
    } catch (error) {
      console.error('Error deleting calculation:', error.message);
    }
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

  const VLE = calculateVLE(calculations);
  const SLE = calculateSLE(calculations);

  const stesspiCalculations = calculations
    .filter((calculation) => calculateSTESSPI(calculation, VLE) > 0)
    .sort((a, b) => calculateSTESSPI(b, VLE) - calculateSTESSPI(a, VLE));

  const mtesspiCalculations = calculations
    .filter((calculation) => calculateMTESSPI(calculation, VLE, SLE) > 0)
    .sort((a, b) => calculateMTESSPI(b, VLE, SLE) - calculateMTESSPI(a, VLE, SLE));

    return (
      <div>
        <h2>Energy Storage System Indexes</h2>
        <br/>
        <div>
          <h3>Short-Term Energy Storage System Index</h3>
          <ul className="calculation-list">
            {stesspiCalculations.map((calculation) => (
              <li key={calculation.calculation_id} className="calculation-item" onClick={() => openModal(calculation)}>
                <div className="calculation-content">
                  <div className="flex items-center gap-2">
                    <div className="w-[25px] h-[25px] rounded-full bg-lime-500"></div>
                    <div>
                      <h2 className="capitalize text-black">{calculation.name}</h2>
                      <h4 className="capitalize text-black">{calculation.category}</h4>
                      <h6 className="capitalize text-black">{calculation.stesspi}</h6>
                    </div>
                  </div>
                </div>
                <button className="delete-button" onClick={() => handleDelete(calculation.calculation_id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
        <br/>
        <div>
          <h3>Mid-Term Energy Storage System Index</h3>
          <ul className="calculation-list">
            {mtesspiCalculations.map((calculation) => (
              <li key={calculation.calculation_id} className="calculation-item" onClick={() => openModal(calculation)}>
                <div className="calculation-content">
                  <div className="flex items-center gap-2">
                    <div className="w-[25px] h-[25px] rounded-full bg-lime-500"></div>
                    <div>
                      <h2 className="capitalize text-black">{calculation.name}</h2>
                      <h4 className="capitalize text-black">{calculation.category}</h4>
                      <h6 className="capitalize text-black">{calculation.mtesspi}</h6>
                    </div>
                  </div>
                </div>
                <button className="delete-button" onClick={() => handleDelete(calculation.calculation_id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Modal isOpen={selectedCalculation !== null} setIsOpen={closeModal}>
          {selectedCalculation && (
            <div>
              <h4>Name: {selectedCalculation.name}</h4>
              <p> Quantity: {selectedCalculation.quantity}</p>
              <p>Category: {selectedCalculation.category}</p>
              <p>Max Critical Recovery Time: {selectedCalculation.max_critical_recovery_time}</p>
              <p>Complete Recovery Time: {selectedCalculation.complete_recovery_time}</p>
              {selectedCalculation.power_consumption !== 0 ? (
                <p>Power Consumption: {selectedCalculation.power_consumption} kW</p>
              ) : (
                <div>
                  <p>Ampere: {selectedCalculation.ampere}</p>
                  <p>Volts: {selectedCalculation.volts}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  };
  
  export default CalculationComponent;
