const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [8, 'name must be atleast 8 Characters or above'],
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Email address is invalid'],
    required: [true, 'Please add an email'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
    select: false
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// HASH PASSWORD

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next()
  this.password = await bcrypt.hash(this.password, 12)
})

// CHECK PASSWORD

userSchema.methods.checkPassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password)
}

// GET JWT

userSchema.methods.getSignJWT = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  })
}

userSchema.methods.createPasswordResetToken = function(){
   const resetToken = crypto.randomBytes(3).toString('hex')
   this.resetPasswordToken = crypto.Hash('sha256').update(resetToken).digest('hex')
   this.resetPasswordExpire = Date.now() + 60 * 60 * 1000
   return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User