const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    duration: { 
        start: {type: Date, required: true },
        end: {type: Date, required: true}
    }, 
    schedule: [ {
        date: { type: Date,required: true },
        hour: { type: String, required: true },
        attendances: [{
            studentID:  { type: Number, required: true },
            attendance: { type: Boolean , required: true },
            reason: { type: String , required: true }
        }]
    }],
    students: [{
        student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' } 
    }]
});

const Course = mongoose.model('Course',courseSchema);
module.exports = Course;