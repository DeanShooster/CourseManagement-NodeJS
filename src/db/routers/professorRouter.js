require('../mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const {ConvertDate} = require('../../utils/Dates');

const Professor = require('../models/professor');
const Student = require('../models/student');
const Course = require('../models/course');

const router = express.Router();


//*********************************************** GET REQUESTS ******************************************************** */

/**
 * Gets student reason for not attending a class on date x. ???
 */
router.get('/student/course/attendance', async(req,res)=>{
    try{
        const course = await Course.findOne( {name: req.query.courseName} );
        if( !course )
            return res.status(400).send( {Message: 'Course not found.'} );
        for(let i = 0; i < course.schedule.length; i++)
            if( ConvertDate(course.schedule[i].date) === req.query.date )
                for(let j = 0; j < course.schedule[i].attendances.length; j++ )
                    if( course.schedule[i].attendances[j].studentID == req.query.id )
                        if( course.schedule[i].attendances[j].reason != 'Empty')
                            return res.send( {reason: course.schedule[i].attendances[j].reason } );
        res.status(400).send( {Message: 'Student or Reason do not exist.'} );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** POST REQUESTS ******************************************************** */

/**
 * Creates a student.
 */
router.post('/students', async(req,res)=>{
    try{
        const info = req.body;
        const student = await new Student(info);
        if( !student )
            return res.status(400).send( {Message: 'Could not create user. DB error.'});
        await student.save();
        res.send( student );
    }
    catch(e){
        if( e.code === 11000)
            return res.status(400).send( {Message: 'Could not create user. Duplicated email or ID.'} );
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

/**
 * Checks if email belongs to a professor / student.
 */
 router.post('/professor/validation', async(req,res)=>{
    try{
        const email = req.body;
        const professor = await Professor.findOne( email );
        if( professor )
            return res.send( true );
        const student = await Student.findOne( email );
        if( student )
            return res.send( false );
        res.send( null );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** PATCH REQUESTS ******************************************************** */

/**
 * Updates professor self information.
 */
 router.patch('/professor', async(req,res)=>{
    try{
        const info = req.body;
        info.password = await bcrypt.hash( info.password , 8);
        const editProfessor = await Professor.findOneAndUpdate( info );
        if( !editProfessor )
            return res.status(400).send( {Message: 'Failed to edit.' });
        res.send( editProfessor );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** DELETE REQUESTS ******************************************************** */

/**
 * Student Deletion.
 */
router.delete('/students', async(req,res)=>{
    try{
        const info = req.body;
        const deletedStudent = await Student.findOneAndDelete( info );
        if( !deletedStudent )
            return res.status(400).send( {Message: 'Failed to remove student. Student not found.' });
        res.send( deletedStudent );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});


module.exports = router;