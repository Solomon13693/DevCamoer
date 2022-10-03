const User = require('../model/User')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const jwt = require('jsonwebtoken')
const SendEmail = require('../utils/Email')
const crypto = require('crypto')

exports.Register = asyncHandler(async (req, res, next) => {

    const checkEmail = await User.findOne({ email: req.body.email })

    if (checkEmail) {
        return next(new ErrorResponse('Email address already exists', 500));
    }

    const user = await User.create(req.body)

    if (!user) {
        return next(new ErrorResponse('An Error has occurred while signing up'))
    }

    return res.status(201).json({
        status: 'success',
        data: { user }
    })

})

exports.Login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse('Please enter email and password', 500));
    }

    const user = await User.findOne({ email: req.body.email }).select('+password')

    if (!user || (!await user.checkPassword(req.body.password))) {
        return next(new ErrorResponse('Invalid login credentials', 401));
    }

    sendTokenResponse(user, 200, res)


})

exports.ForgotPassword = asyncHandler(async function (req, res, next) {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorResponse('No user found with email address', 404));
    }

    const resetToken = await user.createPasswordResetToken()

    await user.save({ validateBeforeSave: false })

    const message = `Your Password reset token is ${resetToken}`

    try {

        await SendEmail({
            email: user.email,
            subject: 'Your password reset token (Valid for 1hour)',
            message
        })

        return res.status(200).json({
            status: 'success',
            message: 'Your password reset token has been send to your email address'
        })

    } catch (error) {

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new ErrorResponse('An Error Occurred while sending mail', 404));

    }


})

exports.ResetPassword = asyncHandler(async function (req, res, next) {

    const hashedToken = await crypto.createHash('sha256').update(req.body.token).digest('hex')

    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } })

    if (!user) {
        return next(new ErrorResponse('Token is invalid or has expired', 400));
    }

    user.password = req.body.password,
        user.resetPasswordToken = undefined,
        user.resetPasswordExpire = undefined
    await user.save()

    return res.status(200).json({
        status: 'success',
        message: 'Your password has been reset !'
    })

})

exports.Protected = asyncHandler(async (req, res, next) => {

    let token;

    // CHECK IF TOKEN IS AVAILABLE

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorResponse('You are not logged in, Please Login to access this route', 401))
    }

    // VERIFY TOKEN
    const decode = await jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decode.id)

    // CHECK IF USER STILL EXIST
    if (!user) {
        return next(new ErrorResponse('User Belonging to this token does not exist', 404))
    }

    // GRANT USER ACCESS 
    req.user = user

    next()

})

exports.UserProfile = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id)

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 400));
    }

    return res.status(200).json({
        status: 'success',
        user
    })

})

exports.UpdateUser = asyncHandler(async (req, res, next) => {

    let user = await User.findById(req.user.id)

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 400));
    }

    const updateField = {
        email: req.body.email,
        name: req.body.name
    }

    user = await User.findByIdAndUpdate(req.user.id, updateField, {
        new: true,
        runValidators: true
    })

    return res.status(200).json({
        status: 'success',
        user
    })


})

exports.UpdateUserPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    if (!(await user.checkPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 400));
    }

    user.password = req.body.password
    await user.save()

    const token = await user.getSignJWT()

    return res.status(200).json({
        status: 'success',
        message: 'Password has been updated successfully',
        token
    })

})

exports.Authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this role`, 401))
        }
        next()
    }
}

const sendTokenResponse = async (user, statusCode, res) => {

    const token = await user.getSignJWT()

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000 ),
        httpOnly: true
    }

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token
      })

}