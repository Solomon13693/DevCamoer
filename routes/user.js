const express = require('express');
const { Register, Login, ForgotPassword, ResetPassword, Protected, UserProfile, UpdateUser, UpdateUserPassword } = require('../controller/AuthController')

const router = express.Router();

router
    .route('/register')
    .post(Register)

router
    .route('/login')
    .post(Login)

router
    .route('/forgotPassword')
    .post(ForgotPassword)

router
    .route('/resetPassword')
    .post(ResetPassword)

router
    .get('/profile', Protected, UserProfile)

router
    .patch('/update/profile', Protected, UpdateUser)

router
    .patch('/update/password', Protected, UpdateUserPassword)

module.exports = router;