const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../database_pg");

/**
 * Route to get all PV systems for the authenticated user.
 * Requires authorization using the "authorize" middleware.
 */
router.get("/pvsystem", authorize, async (req, res) => {
    try {
        // Fetch PV systems for the authenticated user
        const pvSystems = await pool.query(
            "SELECT * FROM pv_system WHERE user_id = $1",
            [req.user.id]
        );

        // Respond with the PV systems
        res.json(pvSystems.rows);
    } catch (err) {
        // Handle internal server errors
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * Route to add a new PV system.
 * Requires authorization using the "authorize" middleware.
 */
router.post("/pvsystem", authorize, async (req, res) => {
    const { duration, peaksunhours, batterytype } = req.body;

    try {
        const newPVSystem = await pool.query(
            "INSERT INTO pv_system (user_id, duration, peaksunhours, batterytype) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.user.id, duration, peaksunhours, batterytype]
        );

        res.json(newPVSystem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * Route to update an existing PV system.
 * Requires authorization using the "authorize" middleware.
 */
router.put("/pvsystem/:id", authorize, async (req, res) => {
    const pvSystemId = req.params.id;
    const { duration, peaksunhours, batterytype } = req.body;

    try {
        const updatedPVSystem = await pool.query(
            "UPDATE pv_system SET duration = $1, peaksunhours = $2, batterytype = $3 WHERE user_id = $4 AND pv_id = $5 RETURNING *",
            [duration, peaksunhours, batterytype, req.user.id, pvSystemId]
        );

        if (updatedPVSystem.rows.length === 0) {
            return res.status(404).json({ message: "PV system not found for the user" });
        }

        res.json(updatedPVSystem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * Route to delete a PV system.
 * Requires authorization using the "authorize" middleware.
 */
router.delete("/pvsystem/:id", authorize, async (req, res) => {
    const pvSystemId = req.params.id;

    try {
        // Delete the PV system
        const deletedPVSystem = await pool.query(
            "DELETE FROM pv_system WHERE pv_id = $1 AND user_id = $2 RETURNING *",
            [pvSystemId, req.user.id]
        );

        if (deletedPVSystem.rows.length === 0) {
            return res.status(404).json({ message: "PV system not found for the user" });
        }

        // Respond with success message
        res.json({ message: "PV system deleted successfully" });
    } catch (err) {
        // Handle internal server errors
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
