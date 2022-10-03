const express = require('express');
const { getCourse, getSingleCourse, createCourse, deleteCourse, updateCourse } = require('../controller/CourseController')
const { Protected, Authorize } = require('../controller/AuthController.js')

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getCourse)
    .post(Protected, createCourse)

router
    .route('/:id')
    .get(getSingleCourse)
    .delete(Protected, deleteCourse)
    .patch(Protected, updateCourse)

module.exports = router
