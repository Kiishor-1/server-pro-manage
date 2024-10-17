if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const { port } = require('./config/appConfig');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: 'Content-Type,Authorization'
}));

const PORT = port;

app.get("/", (req, res) => {
    res.send("Standard root");
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.all("*", (req, res, next) => {
    const error = new Error("No such routes available");
    error.statusCode = 404;
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

app.listen(PORT, () => {
    console.log(`Server is up at port ${PORT}`);
    connectDB()
        .then(() => {
            console.log('Connected to Database');
        })
        .catch((error) => {
            console.error('Database connection failed:', error);
        });
});
