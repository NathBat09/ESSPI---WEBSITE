import React, { useState } from 'react';
import Modal from './modal'; 
import './global.css';

function CalculationModal({ show, onClose, newCalculation, handleInputChange, handleSubmit, buttonText }) {
    const [inputType, setInputType] = useState('powerConsumption');
    const [modal1Open, setModal1Open] = useState(false); 
    const [modal2Open, setModal2Open] = useState(false); 
    const [modal3Open, setModal3Open] = useState(false); 
    const [modal4Open, setModal4Open] = useState(false); 
    const [modal5Open, setModal5Open] = useState(false); 
    const [modal6Open, setModal6Open] = useState(false);
    const [modal7Open, setModal7Open] = useState(false); 
    const [modal8Open, setModal8Open] = useState(false); 

    const toggleModal1 = () => {
        setModal1Open(!modal1Open);
    };

    const toggleModal2 = () => {
        setModal2Open(!modal2Open);
    };

    const toggleModal3 = () => {
        setModal3Open(!modal3Open);
    };

    const toggleModal4 = () => {
        setModal4Open(!modal4Open);
    };

    const toggleModal5 = () => {
        setModal5Open(!modal5Open);
    };

    const toggleModal6 = () => {
        setModal6Open(!modal6Open);
    };

    const toggleModal7 = () => {
        setModal7Open(!modal7Open);
    };

    const toggleModal8 = () => {
        setModal8Open(!modal8Open);
    };
    

    return (
        <div className={`modal-container ${show ? 'open' : ''}`}>
            <div className="flex flex-col gap-4">
                <label className="input-label">Max Critical Recovery Time:</label>
                <button className="description-button" onClick={toggleModal1}>?</button> {/* Button for modal 1 */}
                <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    className="input-field"
                    placeholder="Enter Max Critical Recovery Time"
                    name="max_critical_recovery_time"
                    value={newCalculation.max_critical_recovery_time}
                    onChange={handleInputChange}
                    required
                />
                <br/>
                {/* Modal 1 for description */}
                <Modal isOpen={modal1Open} setIsOpen={setModal1Open}>
                    <div>
                        The maximum down time a load can experience before services are affected. Maximum critical recovery time is measured in days.
                    </div>
                </Modal>

                <label className="input-label">Complete Recovery Time:</label>
                <button className="description-button" onClick={toggleModal2}>?</button> {/* Button for modal 2 */}
                <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    className="input-field"
                    placeholder="Enter Complete Recovery Time"
                    name="complete_recovery_time"
                    value={newCalculation.complete_recovery_time}
                    onChange={handleInputChange}
                    required
                />
                <br/>
                {/* Modal 2 for description */}
                <Modal isOpen={modal2Open} setIsOpen={setModal2Open}>
                    <div>
                        Number of days a load requires to recover from a blackout. After an event, analysis of the affected areas is required to gauge the complete energy restoration time.
                    </div>
                </Modal>

                <label className="input-label">Input Type:</label>
                <button className="description-button" onClick={toggleModal3}>?</button> {/* Button for modal 3 */}
                <select
                    className="input-field"
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                    required
                >
                    <option value="powerConsumption">Power needed (kW) </option>
                    <option value="amperesVolts">Amperes and Volts</option>
                </select>
                <br/>
                {/* Modal 3 for description */}
                <Modal isOpen={modal3Open} setIsOpen={setModal3Open}>
                    <div>
                        Energy needed for the element to function properly. You can enter (amps and volts) or just watts depending on the information that you have.
                    </div>
                </Modal>

                {inputType === "powerConsumption" && (
                    <>
                        <label className="input-label">Power needed:</label>
                        <button className="description-button" onClick={toggleModal4}>?</button> {/* Button for modal 4 */}
                        <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            className="input-field"
                            placeholder="Enter Power Consumption"
                            name="power_consumption"
                            value={newCalculation.power_consumption}
                            onChange={handleInputChange}
                            required
                        />
                        <br/>
                        {/* Modal 4 for description */}
                        <Modal isOpen={modal4Open} setIsOpen={setModal4Open}>
                            <div>
                                Energy needed for the element to function properly.
                            </div>
                        </Modal>
                    </>
                )}

                {inputType === "amperesVolts" && (
                    <>
                        <label className="input-label">Amperes:</label>
                        <button className="description-button" onClick={toggleModal5}>?</button> {/* Button for modal 5 */}
                        <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            className="input-field"
                            placeholder="Enter Amperes"
                            name="ampere"
                            value={newCalculation.ampere}
                            onChange={handleInputChange}
                            required
                        />
                        <br/>
                        {/* Modal 5 for description */}
                        <Modal isOpen={modal5Open} setIsOpen={setModal5Open}>
                            <div>
                                Enter the amperes needed.
                            </div>
                        </Modal>

                        <label className="input-label">Volts:</label>
                        <button className="description-button" onClick={toggleModal6}>?</button> {/* Button for modal 6 */}
                        <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            className="input-field"
                            placeholder="Enter Volts"
                            name="volts"
                            value={newCalculation.volts}
                            onChange={handleInputChange}
                            required
                        />
                        <br/>
                        {/* Modal 6 for description */}
                        <Modal isOpen={modal6Open} setIsOpen={setModal6Open}>
                            <div>
                                Enter the volts needed.
                            </div>
                        </Modal>
                    </>
                )}

                <label className="input-label">Element Name:</label>
                <button className="description-button" onClick={toggleModal7}>?</button> {/* Button for modal 7 */}
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter Element Name"
                    name="name"
                    value={newCalculation.name}
                    onChange={handleInputChange}
                    required
                />
                <br/>
                {/* Modal 7 for description */}
                <Modal isOpen={modal7Open} setIsOpen={setModal7Open}>
                    <div>
                        Put the element name here
                    </div>
                </Modal>

                <label className="input-label">Quantity:</label>
                <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    className="input-field"
                    placeholder="Quantity"
                    name="quantity"
                    value={newCalculation.quantity}
                    onChange={handleInputChange}
                    required
                />
                <br/>

                <label className="input-label">Category:</label>
                <button className="description-button" onClick={toggleModal8}>?</button> {/* Button for modal 8 */}
                <div className="radio-buttons">
                    <br/>
                    <label>
                        <input
                            type="radio"
                            name="category"
                            value="NEL"
                            checked={newCalculation.category === "NEL"}
                            onChange={handleInputChange}
                        />
                        Non Essential (NEL)
                    </label>
                    <br/>
                    <label>
                        <input
                            type="radio"
                            name="category"
                            value="DL"
                            checked={newCalculation.category === "DL"}
                            onChange={handleInputChange}
                        />
                        Discretionary (DL)
                    </label>
                    <br/>
                    <label>
                        <input
                            type="radio"
                            name="category"
                            value="EL"
                            checked={newCalculation.category === "EL"}
                            onChange={handleInputChange}
                        />
                        Essential (EL)
                    </label>
                    <br/>
                    <label>
                        <input
                            type="radio"
                            name="category"
                            value="CL"
                            checked={newCalculation.category === "CL"}
                            onChange={handleInputChange}
                        />
                        Critical (CL)
                    </label>
                    <br />
                </div>
                <br/>
                {/* Modal 8 for description */}
                <Modal isOpen={modal8Open} setIsOpen={setModal8Open}>
                    <div>
                    <p>The ranking system outlined in this section separates loads
                    into five categories ranging from least important to most
                    important
                    </p>

                    <p>
                        ● Non-Essential (NEL) – Do not provide life-sustaining
                        services, but may impact a non-trivial number of
                        people. For example: cinemas, satellite government
                        offices, coffee shops, bars/pubs, etc. 
                    </p>

                    <p>
                        ● Discretionary (DL) – Do not provide life-sustaining
                        service, but may impact a non-trivial number of
                        people and provide useful services or goods. For
                        example: department stores, private offices, etc. 
                    </p>

                    <p>
                        ● Essential (EL) – Have high impact on services for the
                        majority of people. Provide non-critical life-sustaining
                        services or manufacturing capability that supports
                        critical services. For example, restaurants, the
                        pharmaceutical industry, bakeries, agriculture,
                        food processing industry, fire department, etc. 
                    </p>

                    <p>
                        ● Critical (CL) – indispensable and absolute necessary
                        loads for life-sustaining, health, and security services.
                        For example, food stores, shelters, hospitals, police
                        departments, communications, government, etc. 
                    </p>
                    </div>
                </Modal>

                <br/>
                <button type="submit" className="submit-button" onClick={handleSubmit}>Submit
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

export default CalculationModal;
