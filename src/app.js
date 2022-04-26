require('./db/mongoose');
const express = require('express');
const cors = require('cors');

const userRouter = require('./db/routers/userRouter');
const professorRouter = require('./db/routers/professorRouter');
const studentRouter = require('./db/routers/studentRouter');
const courseRouter = require('./db/routers/courseRouter');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(professorRouter);
app.use(studentRouter);
app.use(courseRouter);

app.listen(port, ()=>{
    console.log('Server is on on Port:',port);
});