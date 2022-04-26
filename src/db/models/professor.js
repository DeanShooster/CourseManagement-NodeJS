const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const professorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    birthDate: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true, },
    tokens: [ {
        token: { type: String, required: true }
    }],
});

/**
 * Encrypts password if needed before every save.
 */
professorSchema.pre('save',async function(next){
    if (this.isModified('password')) {
        const professorPassword = await bcrypt.hash(this.password, 8);
        this.password = professorPassword;
    }
    next();
});

/**
 * Generates a log in token.
 * @returns encrypted token
 */
professorSchema.methods.generateToken = async function () {
    const token = jwt.sign( { email: this.email }, process.env.PORT, { expiresIn: "1d" } );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
};

const Professor = mongoose.model('Professor',professorSchema);
module.exports = Professor;