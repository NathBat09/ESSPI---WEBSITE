import React from 'react';
import './global.css';

const CalculationModal = ({ newCalculation, handleInputChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <label>Max Critical Recovery Time:</label>
      <input
        type="number"
        name="max_critical_recovery_time"
        value={newCalculation.max_critical_recovery_time}
        onChange={handleInputChange}
        required
      />

      <label>Complete Recovery Time:</label>
      <input
        type="number"
        name="complete_recovery_time"
        value={newCalculation.complete_recovery_time}
        onChange={handleInputChange}
        required
      />

      <label>Power Consumption (or Amperes & Volts):</label>
      <input
        type="number"
        name="power_consumption"
        value={newCalculation.power_consumption}
        onChange={handleInputChange}
        required
      />

      <label>Category:</label>
      <select
        name="category"
        value={newCalculation.category}
        onChange={handleInputChange}
        required
      >
        <option value="NEL">Non-Essential Load</option>
        <option value="DL">Discretionary Load</option>
        <option value="EL">Essential Load</option>
        <option value="CL">Critical Load</option>
      </select>

      <button type="submit">Add Calculation</button>
    </form>
  );
};

export default CalculationModal;
