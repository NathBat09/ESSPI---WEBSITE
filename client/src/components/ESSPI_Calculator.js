import React, { useState, useEffect, useMemo } from "react";
import "./global.css";
import Modal from "./modal";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const CalculationComponent = ({ projectId }) => {
  const [calculations, setCalculations] = useState([]);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null); // Timestamp to control updates

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchCalculationsRealtime = () => {
      try {
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

        // Firestore real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedCalculations = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Only update state if data actually changes
          if (JSON.stringify(fetchedCalculations) !== JSON.stringify(calculations)) {
            setCalculations(fetchedCalculations);
            setLastUpdated(Date.now()); // Update timestamp to control recalculations
          }
        });

        return unsubscribe; // Cleanup listener on unmount
      } catch (error) {
        console.error("Error setting up real-time listener:", error.message);
      }
    };

    const unsubscribe = fetchCalculationsRealtime();
    return () => unsubscribe && unsubscribe(); // Clean up listener
  }, [projectId]);

  const recalculateIndexes = async (calculations) => {
    const VLE = calculateVLE(calculations);
    const SLE = calculateSLE(calculations);

    for (const calculation of calculations) {
      let stesspi = 0;
      let mtesspi = 0;

      if (calculation.category === "CL" || calculation.category === "EL") {
        stesspi = calculateSTESSPI(calculation, VLE).toFixed(2);
      }

      if (calculation.category === "DL" || calculation.category === "NEL") {
        mtesspi = calculateMTESSPI(calculation, VLE, SLE).toFixed(2);
      }

      try {
        await updateDoc(doc(db, "calculations", calculation.id), {
          stesspi: parseFloat(stesspi),
          mtesspi: parseFloat(mtesspi),
        });
      } catch (error) {
        console.error(
          `Error updating indexes for ${calculation.name}:`,
          error.message
        );
      }
    }
  };

  const openModal = (calculation) => {
    setSelectedCalculation(calculation);
  };

  const closeModal = () => {
    setSelectedCalculation(null);
  };

  const handleDelete = async (calculationId) => {
    try {
      await deleteDoc(doc(db, "calculations", calculationId));
    } catch (error) {
      console.error("Error deleting calculation:", error.message);
    }
  };

  const calculateVLE = useMemo(() => {
    return (calculations) =>
      calculations.reduce(
        (total, calc) =>
          total +
          (calc.category === "CL" || calc.category === "EL"
            ? calc.power_consumption
            : 0),
        0
      );
  }, [calculations]);

  const calculateSLE = useMemo(() => {
    return (calculations) =>
      calculations.reduce(
        (total, calc) =>
          total +
          (calc.category === "DL" || calc.category === "NEL"
            ? calc.power_consumption
            : 0),
        0
      );
  }, [calculations]);

  const calculateSTESSPI = (calculation, VLE) => {
    let power = calculation.power_consumption;
    if (calculation.power_consumption === 0 && calculation.ampere > 0 && calculation.volts > 0) {
      power = calculation.ampere * calculation.volts;
    }

    if (
      calculation.max_critical_recovery_time > 0 &&
      VLE > 0 &&
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
      calculation.max_critical_recovery_time > 0 &&
      (VLE + SLE) > 0 &&
      (calculation.category === "DL" || calculation.category === "NEL")
    ) {
      return (
        (power / (VLE + SLE)) *
        (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
      );
    }
    return 0;
  };

  const VLE = useMemo(() => {
    const vleValue = calculateVLE(calculations);
    console.log("Calculated VLE (Critical + Essential Load Energy):", vleValue);
    return vleValue;
  }, [calculations]);
  
  const SLE = useMemo(() => {
    const sleValue = calculateSLE(calculations);
    console.log("Calculated SLE (Discretionary + Non-Essential Load Energy):", sleValue);
    return sleValue;
  }, [calculations]);
  

  const stesspiCalculations = useMemo(() => {
    return calculations
      .filter((calculation) => calculateSTESSPI(calculation, VLE) > 0)
      .sort((a, b) => calculateSTESSPI(b, VLE) - calculateSTESSPI(a, VLE));
  }, [calculations, VLE]);

  const mtesspiCalculations = useMemo(() => {
    return calculations
      .filter((calculation) => calculateMTESSPI(calculation, VLE, SLE) > 0)
      .sort((a, b) => calculateMTESSPI(b, VLE, SLE) - calculateMTESSPI(a, VLE, SLE));
  }, [calculations, VLE, SLE]);

  return (
    <div>
      <h2>Energy Storage System Indexes</h2>
      <div>
        <h3>Short-Term Energy Storage System Index</h3>
        <ul className="calculation-list">
          {stesspiCalculations.map((calculation) => (
            <li
              key={calculation.id}
              className="calculation-item"
              onClick={() => openModal(calculation)}
            >
              <div className="calculation-content">
                <h2>{calculation.name || "Unnamed Calculation"}</h2>
                <h4>{calculation.category || "No Category"}</h4>
                <h6>STESSPI: {calculation.stesspi || calculateSTESSPI(calculation, VLE)}</h6>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal from opening on delete
                  handleDelete(calculation.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Mid-Term Energy Storage System Index</h3>
        <ul className="calculation-list">
          {mtesspiCalculations.map((calculation) => (
            <li
              key={calculation.id}
              className="calculation-item"
              onClick={() => openModal(calculation)}
            >
              <div className="calculation-content">
                <h2>{calculation.name || "Unnamed Calculation"}</h2>
                <h4>{calculation.category || "No Category"}</h4>
                <h6>MTESSPI: {calculation.mtesspi || calculateMTESSPI(calculation, VLE, SLE)}</h6>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal from opening on delete
                  handleDelete(calculation.id);
                }}
              >
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
            <p>Quantity: {selectedCalculation.quantity}</p>
            <p>Category: {selectedCalculation.category}</p>
            <p>Max Critical Recovery Time: {selectedCalculation.max_critical_recovery_time}</p>
            <p>Complete Recovery Time: {selectedCalculation.complete_recovery_time}</p>
            {selectedCalculation.power_consumption ? (
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
