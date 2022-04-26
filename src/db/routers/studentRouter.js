require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const { DateDiff,ConvertDate } = require('../../utils/Dates');

const Student = require('../models/student');
const Course = require('../models/course');
const { default: mongoose } = require('mongoose');

const router = express.Router();

//*********************************************** GET REQUESTS ******************************************************** */

/**
 * Gets all courses of student X.
 */
router.get('/student/courses',async(req,res)=>{
    try{
        const token = req.headers.token;
        const students = await Student.find({});
        let student = null;
        for(let i = 0; i < students.length; i++) // Finds logged in student.
            for(let j = 0; j < students[i].tokens.length; j++)
                if( token === students[i].tokens[j].token ){
                    student = students[i];
                    break;
                }
        if( !student )
            return res.status(400).send( {Message: 'Logged in user not found.' } );
        await student.populate('courses.course');
        res.send( student.courses );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

/**
 * Gets student ID.
 */
router.get('/student',async(req,res)=>{
    try{
        const token = req.headers.token;
        const students = await Student.find({});
        let student = null;
        for(let i = 0; i < students.length; i++) // Finds logged in student.
            for(let j = 0; j < students[i].tokens.length; j++)
                if( token === students[i].tokens[j].token ){
                    student = students[i];
                    break;
                }
        if( !student )
            return res.status(400).send( {Message: 'Logged in user not found.' } );
        res.send( {ID: student.ID} );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** POST REQUESTS ******************************************************** */

/**
 * Adds student to a course.
 */
router.post('/student/course/register', async(req,res)=> {
    try{
        const courseName = req.body.courseName;   const token = req.body.token;
        const course = await Course.findOne( {name: courseName } );
        if( !course )
            return res.status(400).send( { Message: 'Course not found.'} );
        const students = await Student.find({});
        let student = null;
        for(let i = 0; i < students.length; i++) // Finds logged in student.
            for(let j = 0; j < students[i].tokens.length; j++)
                if( token === students[i].tokens[j].token ){
                    student = students[i];
                    break;
                }
        if( !student )
            return res.status(400).send( {Message: 'Logged in user not found.' } );
        await student.populate('courses.course');
        for(let i = 0; i < student.courses.length; i++ ) // Checks if student already exists in the course.
            if( course.name === student.courses[i].course.name )
                return res.status(400).send( {Message: 'You are already signed up to course: ' + course.name } );
        student.courses.push( { course: course._id } );  course.students.push( { student: student._id } );
        for(let i = 0; i < course.schedule.length; i++)  // Pushes student to the attendance of each day of schedule
            course.schedule[i].attendances.push ( { studentID: student.ID, attendance: false, reason: 'Empty' } );
        await course.save();   await student.save();
        res.send( course );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** PATCH REQUESTS ******************************************************** */

/**
 * Updates student information.
 */
 router.patch('/student', async(req,res)=>{
    try{
        const info = req.body;
        info.password = await bcrypt.hash( info.password , 8);
        const editStudent = await Student.findOneAndUpdate( info );
        if( !editStudent )
            return res.status(400).send( {Message: 'Failed to edit.' });
        res.send( editStudent );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

/**
 * Updates student attendance in a course.
 */
router.patch('/student/attendance', async(req,res)=>{
    try{
        const token = req.body.token;
        const students = await Student.find({});
        let student = null;
        for(let i = 0; i < students.length; i++) // Finds logged in student.
            for(let j = 0; j < students[i].tokens.length; j++)
                if( token === students[i].tokens[j].token ){
                    student = students[i];
                    break;
                }
        if( !student )
            return res.status(400).send( {Message: 'Logged in user not found.' } );
        const course = await Course.findOne( {name: req.body.courseName} );
        if( !course )
                return res.status(400).send( {Message: 'Course not found.' } );
        const date = req.body.date;
        for(let i = 0; i < course.schedule.length; i++){   // Finds the date in the schedule array and then finds the student
            if( ConvertDate(course.schedule[i].date) == date ){  // in the student attendances array and updates accordingly.
                for(let j = 0; j < course.schedule[i].attendances.length; j++){
                    if( course.schedule[i].attendances[j].studentID == student.ID ){
                        if( req.body.attendance == 'Yes')
                            course.schedule[i].attendances[j].attendance = true;
                        else{
                            course.schedule[i].attendances[j].attendance = false;
                            course.schedule[i].attendances[j].reason = req.body.reason;
                        }
                    }
                }
            }
        }
        await course.save();
        res.send( course );
    }
    catch(e){
        console.log(e.Message);
        res.status(500).send( {Message: 'Server Error.'} );
    }
});




module.exports = router;

