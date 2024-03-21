const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

//Routes

//Register and login routes

app.use("/auth", require("./routes/jwtAuth"));

app.use("/dashboard", require("./routes/dashboard"));

app.use("/api", require("./routes/calculations"));

app.use("/pv", require("./routes/pvsystem"));

app.listen(5000, () => {
    console.log("server is running on port 5000")
})