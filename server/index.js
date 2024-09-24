const PORT = process.env.PORT || 5000;

const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", require("./routes/jwtAuth"));
app.use("/dashboard", require("./routes/dashboard"));

// Projects route
app.use("/projects", require("./routes/projects"));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
