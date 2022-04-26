require('mongoose');
const { DateDiff,AddDays } = require('../../utils/Dates');
const express = require('express');
const Course = require('../models/course');
const Student = require('../models/student');

const router = express.Router();

//*********************************************** GET REQUESTS ******************************************************** */

/**
 * Gets all existing courses.
 */
router.get('/courses', async(req,res)=>{
    try{
        const courses = await Course.find();
        if( !courses )
            return res.status(400).send( {Message: 'No courses in the system.'} );
        res.send(courses);
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

/**
 * Gets all information about a course.
 */
router.get('/courses/:name', async(req,res)=>{
    try{
        const courseName = req.params;
        const course = await Course.findOne( courseName );
        if( !course )
            return res.status(400).send( {Message: 'Course not found.'} );
        const courseDocument = await course.populate('students.student');
        res.send( courseDocument );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** POST REQUESTS ******************************************************** */

/**
 *  Creates a course.
 */
router.post('/courses', async(req,res)=>{
    try{
        const info =  { name: req.body.name, duration: req.body.startingDate + ':' + req.body.endingDate };
        const isCourseExist = await Course.findOne( {name: info.name}) ;
        if( isCourseExist )
            return res.status(400).send( { Message: 'Course already exist.' } );
        info.duration = info.duration.replace(/-/g,'/');
        if( info.duration.length < 20 )
            return res.status(400).send( {Message: 'Invalid Date input.'} );
        const startingDate = info.duration.slice(0,10);  const endingDate = info.duration.slice(11,21);
        const diffDays = DateDiff(startingDate,endingDate)
        if( diffDays < 7)
            return res.status(400).send( { Message: 'Invalid Date input.' } );
        const schedule = []; let count = 0;
        for( let i = 0; i <= diffDays; i++ ){
            const date = AddDays( startingDate, i );
            if( date )
                schedule[i-count] = { date, hour: '9:00', attendances: [] }; 
            else
                count++;        
        }
        const courseInfo = { name: info.name, duration: {start: new Date(startingDate), end: new Date(endingDate) }, schedule };
        const course = await new Course(courseInfo);
        if( !course)
            return res.status(400).send( { Message: 'Failed to create a course.'} );
        await course.save();
        res.send( course );
    }
    catch(e){
        if( e.code === 11000)
            return res.status(400).send( {Message: 'Could not create course. Duplicated name.'} );
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

//*********************************************** PATCH REQUESTS ******************************************************** */

/**
 * Adds a student to a course.
 */
router.patch('/courses/students/add', async(req,res)=> {
    try{
        const info = req.body;
        const course = await Course.findOne( { name: info.course} );
        if( !course)
            return res.status(400).send( { Message: 'Course ' + info.course + ' does not exist.'} );
        const student = await Student.findOne( {ID: info.studentID} );
        if( !student )
            return res.status(400).send( { Message: 'Student with ID ' + info.studentID + ' does not exist.'} );
        await course.populate('students.student');
        for(let i = 0; i < course.students.length; i++ ) // Checks if student already exists in the course.
            if( student.ID === course.students[i].student.ID )
                return res.status(400).send( {Message: 'Student with ID '+ info.studentID +  ' is already in the course.'} );
        for(let i = 0; i < course.schedule.length; i++)  // Pushes student to the attendance of each day of schedule
            course.schedule[i].attendances.push ( { studentID: student.ID, attendance: false, reason: 'Empty' } );

        course.students.push( { student: student._id} );    student.courses.push( { course: course._id} );
        await course.save();   await student.save();
        res.send(course);
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

/**
 * Removes a student from a course.
 */
router.patch('/courses/students/remove', async(req,res)=> {
    try{
        const info = req.body;
        const course = await Course.findOne( { name: info.course} );
        if( !course)
            return res.status(400).send( { Message: 'Course ' + info.course + ' does not exist.'} );
        const student = await Student.findOne( {ID: info.studentID} );
        if( !student )
            return res.status(400).send( { Message: 'Student with ID ' + info.studentID + ' does not exist.'} );
        await course.populate('students.student');   let flag = false;
        for(let i = 0; i < course.students.length; i++)  // Removes a student from course student list.
            if( student.ID === course.students[i].student.ID ){
                course.students.splice(i,1);  flag = true;
                break;
            }
        if( !flag ) // Error for removing students that do not belong to course.
            return res.status(400).send( {Message: 'Student does not belong to the course.'} );
        for(let i = 0; i < course.schedule.length; i++ )  // Removes a student from course attendance list.
            for(let j = 0; j < course.schedule[i].attendances.length; j++ ) 
                if( student.ID === course.schedule[i].attendances[j].studentID ){
                    course.schedule[i].attendances.splice(j,1);
                    break;
                }
        await student.populate('courses.course');
        for(let i = 0; i < student.courses.length; i++) // Removes a course from student courses list.
            if( course.name === student.courses[i].course.name ){
                student.courses.splice(i,1);
                break;
            }
        await student.save();    await course.save();
        res.send( course );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} ); 
    }
});

//*********************************************** DELETE REQUESTS ******************************************************** */

/**
 * Course deletion.
 */
router.delete('/courses', async(req,res)=>{
    try{
        const course = req.body;
        const deletedCourse = await Course.findOneAndDelete( course );
        if( !deletedCourse )
            return res.status(400).send( { Message: 'Failed to remove course. Course not found.'} );
        res.send( deletedCourse );
    }
    catch(e){
        res.status(500).send( {Message: 'Server Error.'} );
    }
});

module.exports = router;