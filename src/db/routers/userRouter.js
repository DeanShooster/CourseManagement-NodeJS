require('../mongoose');
const express = require('express');
const bcrypt = require('bcrypt');

const Professor = require('../models/professor');
const Student = require('../models/student');

const router = express.Router();

/**
 * Generic 'Login' request to Professor and students.
 * Sends token,name,user(professor/student) to back to the client.
 */
router.post('/login', async (req,res)=>{
    try{
        const loginInfo = req.body;
        const professor = await Professor.findOne( {email: loginInfo.email} );
        if( professor ){ // Professor validation
            const isMatch = await bcrypt.compare(loginInfo.password, professor.password);
            if( !isMatch )
                return res.status(404).send( { Message: 'Invalid Credentials.' } );
            const token = await professor.generateToken();
            return res.send( {token, name:professor.firstName,isProfessor: true} );
        }
        const student = await Student.findOne( {email: loginInfo.email} );
        if( student ){ // Student validation
            const isMatch = await bcrypt.compare(loginInfo.password, student.password);
            if( !isMatch )
                return res.status(404).send( { Message: 'Invalid Credentials.' } );
            const token = await student.generateToken();
            return res.send( {token, name:student.firstName,isProfessor: false} );
        }
        res.status(404).send( {Message: 'Invalid Credentials.'} );
    }
    catch(e){
        res.status(500).send( {Message: 'Server error.'} );
    }
});

/**
 * Generic Login validation.
 */
router.post('/validation', async(req,res)=>{
    try{
        const token = req.body.token;
        const professors = await Professor.find({});
        for(let i = 0; i < professors.length; i++)
            for(let j = 0; j < professors[i].tokens.length; j++)
                if( token === professors[i].tokens[j].token )
                    return res.send( {name: professors[i].firstName,isProfessor: true} );
        const students = await Student.find({});
        for(let i = 0; i < students.length; i++)
            for(let j = 0; j < students[i].tokens.length; j++)
                if( token === students[i].tokens[j].token )
                    return res.send( {name: students[i].firstName,isProfessor: false} );
        res.send( { Message: 'User not logged in.'} );
    }
    catch(e){
        res.status(500).send( {Message: 'Server error.'} );
    }
});

/**
 * Generic Logout.
 */
router.post('/logout', async(req,res)=>{
    try{
        const token = req.body.token;
        let isMatch = false;
        const professors = await Professor.find({});
        for(let i = 0; i < professors.length; i++){
            for(let j = 0; j < professors[i].tokens.length; j++)
            {
                if( token === professors[i].tokens[j].token ){
                    professors[i].tokens.pop();
                    isMatch = true;
                    await professors[i].save();
                    break;
                }    
            }
        }
        if( isMatch )
            return res.send( {} );
        const students = await Student.find({});
        for(let i = 0; i < students.length; i++){
            for(let j = 0; j < students[i].tokens.length; j++)
            {
                if( token === students[i].tokens[j].token ){
                    students[i].tokens.pop();
                    isMatch = true;
                    await students[i].save();
                    break;
                }    
            }
        }
        if( isMatch )
            return res.send( {} );
        res.send( {Message: 'Invalid token.'});
    }
    catch(e){
        res.status(500).send( {Message: 'Server error.'} );
    }
});


module.exports = router;