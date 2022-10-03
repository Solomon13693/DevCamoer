const express = require('express');
const { getBootcamps, createBootcamp, getBootcamp, updateBootcamp, deleteBootcamp, uploadImage } = require('../controller/BootcampController')
const courseRouter = require('./course')
const { Protected, Authorize } = require('../controller/AuthController.js')

const router = express.Router()

router.use('/:bootcampId/courses', courseRouter)

router
    .route('/')
    .get(getBootcamps)
    .post(Protected, uploadImage, createBootcamp)

router
    .route('/:id')
    .get(getBootcamp)
    .patch(Protected, updateBootcamp)
    .delete(Protected, deleteBootcamp)

module.exports = router;