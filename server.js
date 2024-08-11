const express = require("express")
const dotenv = require("dotenv")
const cors = require('cors')
const connectDB = require('./config/db.js');
const userRoutes = require("./routes/user.js")
const classroomRoutes = require("./routes/classroom.js")
const app= express()
dotenv.config();
connectDB();
app.use(cors({
  origin: '*', 
  credentials: true
}));
app.use(express.json())

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("Hello app")
})

app.use("/api/user", userRoutes);
app.use("/api/classroom", classroomRoutes);

app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});
  