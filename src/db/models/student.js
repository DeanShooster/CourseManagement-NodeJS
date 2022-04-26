const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
    ID: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birthDate: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true, },
    courses: [ {
        course: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' }
    }],
    tokens: [ {
        token: { type: String, required: true }
    }],
});

/**
 * Encrypts password if needed before every save.
 */
studentSchema.pre('save',async function(next){
    if (this.isModified('password')) {
        const studentPassword = await bcrypt.hash(this.password, 8);
        this.password = studentPassword;
    }
    next();
});

/**
 * Generates a log in token.
 * @returns encrypted token
 */
studentSchema.methods.generateToken = async function () {
    const token = jwt.sign( { email: this.email }, process.env.PORT, { expiresIn: "1d" } );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;