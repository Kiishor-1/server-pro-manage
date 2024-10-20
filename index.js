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
const userRoutes = require('./routes/userRoutes');
const FRONT_END = process.env.FRONT_END;


const corsOptions = {
    origin: FRONT_END,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};


app.use(cors(corsOptions));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Standard root");
});


// app.use((req, res, next) => {
//     console.log('Incoming request:', {
//         method: req.method,
//         url: req.url,
//         origin: req.headers.origin,
//         headers: req.headers
//     });
//     next();
// });

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use('/api/v1/users', userRoutes);

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

app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
    connectDB()
        .then(() => {
            console.log('Connected to Database');
        })
        .catch((error) => {
            console.error('Database connection failed:', error);
        });
});
