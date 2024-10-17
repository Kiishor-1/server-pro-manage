if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const { port } = require('./config/appConfig');


app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: 'Content-Type,Authorization'
}));

const PORT = port;


app.get("/", (req, res) => {
    res.send("Standard root");
})

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
