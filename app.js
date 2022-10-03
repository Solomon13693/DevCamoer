const express = require('express')
const dotenv = require('dotenv')
const errorHandler = require('./middleware/error');
const BootcampRoute = require('./routes/bootcamp')
const CourseRoute = require('./routes/course')
const UserRoute = require('./routes/user')
const morgan = require('morgan');
require('colors');
const cookieParser = require('cookie-parser')

const app = express()

dotenv.config({ path: './config.env' })

// MORGAN MIDDLEWARE
app.use(morgan('dev'))

app.use(cookieParser())

// BODY PARSERS
app.use(express.json())

// STATIC FILE
app.use(express.static('public'))

// MOUNT ROUTING
app.use('/api/v1/bootcamp', BootcampRoute)
app.use('/api/v1/course', CourseRoute)
app.use('/api/v1/auth', UserRoute)

app.use('*', function (req, res) {
    return res.status(404).json({
        success: false,
        message: `No routes found for ${req.hostname}${req.baseUrl}`
    })
})

app.use(errorHandler)

module.exports = app