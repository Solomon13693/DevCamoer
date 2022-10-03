const Course = require('../model/Course')
const Bootcamp = require('../model/Bootcamp')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')

exports.getCourse = asyncHandler(async(req, res, next) => {

    let query

    if(req.params.bootcampId){
        query = Course.find({ bootcamp: req.params.bootcampId })
    } else {
        query = Course.find()
    }

    const course = await query

    if(course.length === 0){
         return next(
            new ErrorResponse('Course not found', 404)
         )
    } else {
         res.status(200).json({
            length: course.length,
            success: true,
            data: {
                course
            }
        })
    }

})

exports.getSingleCourse = asyncHandler(async(req, res, next) => {

    const course = await Course.findById(req.params.id)

    if(!course){
         return next(
            new ErrorResponse(`Course not found with ID of ${req.params.id}`, 404)
         )
    } else {
         res.status(200).json({
            success: true,
            data: {
                course
            }
        })
    }

})

exports.createCourse = asyncHandler(async(req, res, next) => {

    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(
           new ErrorResponse(`No Bootcamp found with ID of ${req.params.bootcampId}`, 404)
        )
   }
    
    const course = await Course.create(req.body)

    if(!course){
         return next(
            new ErrorResponse(`An Error Occur !!!`, 404)
         )
    } else {
        res.status(200).json({
            success: true,
            data: {
                course
            }
        })
    }

})

exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id)

    if(!course){
        return next(
            new ErrorResponse(`Bootcamp with ID ${req.params.id} is not found`, 400)
        );
    }

    if(course.user.id !== req.user.id){
        return next(
            new ErrorResponse(`User with ID ${req.user.id} is not authorized to update this route`, 401)
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    return res.status(201).json({
        success: true,
        data: { course }
    })

})

exports.deleteCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id)

    if (!course) {
        return next(
            new ErrorResponse(`No course found with id ${req.params.id}`, 404)
        );
    }

    if(course.user.id !== req.user.id){
        return next(
            new ErrorResponse(`User with ID ${req.user.id} is not authorized to update this route`, 401)
        );
    }

    course = await Course.findByIdAndDelete(req.params.id)

    return res.status(204).json({
        success: true,
        data: null
    })

})