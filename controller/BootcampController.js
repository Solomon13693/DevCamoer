const asyncHandler = require('../middleware/async')
const Bootcamp = require('../model/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/images')
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const random = Math.round(Math.random() * 1000000000);
        cb(null, `bootcamp_${random}.${ext}`)
    }
})

const upload = multer({ storage: storage })

exports.uploadImage = upload.single('image')

exports.getBootcamps = asyncHandler(async (req, res, next) => {

    let query;

    // (1) FILTERING
    const queryObj = { ...req.query }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach(el => delete queryObj[el]);

    // Advance filterings
    const queryStr = JSON.stringify(queryObj)
    queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    query = Bootcamp.find(JSON.parse(queryStr))

    // (2) SORTING OBJECT
    if (req.query.sort) {
        const sortBy = req.query.sort.split(' , ').join('')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    // (3) FIELDS
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        query = query.select(fields)
    } else {
        query = query.select('-__v')
    }

    // (4) PAGINATION

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page - 1) * limit
    const endIndex = (page * limit)
    const total = await Bootcamp.countDocuments()


    query = query.skip(startIndex).limit(limit)

    // Executing Object 
    const bootcamp = await query;

    // IMPLEMENT PAGINATION
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    if (bootcamp.length === 0) {
        return next(
            new ErrorResponse('Bootcamp not found', 404)
        );
    } else {
        return res.status(200).json({
            success: true,
            length: bootcamp.length,
            pagination: pagination,
            data: { bootcamp }
        })
    }

})

exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
        );
    } else {
        return res.status(200).json({
            success: true,
            data: { bootcamp }
        })
    }

})

exports.createBootcamp = asyncHandler(async (req, res, next) => {

    req.body.user = req.user.id

    const exists = await Bootcamp.findOne({ name: req.body.name });

    if (exists) {
        return next(
            new ErrorResponse('Bootcamp already exist', 402)
        );
    }

    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 402)
        );
    }

    const filteredBody = req.body
    if (req.file) filteredBody.image = req.file.filename

    const bootcamp = await Bootcamp.create(filteredBody)

    return res.status(201).json({
        success: true,
        data: { bootcamp }
    })

})

exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp){
        return next(
            new ErrorResponse(`Bootcamp with ID ${req.params.id} is not found`, 400)
        );
    }

    if(bootcamp.user.id !== req.user.id){
        return next(
            new ErrorResponse(`User with ID ${req.user.id} is not authorized to update this route`, 401)
        );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    return res.status(201).json({
        success: true,
        data: { bootcamp }
    })

})

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
        );
    }

    if(bootcamp.user.id !== req.user.id){
        return next(
            new ErrorResponse(`User with ID ${req.user.id} is not authorized to update this route`, 401)
        );
    }

    bootcamp.remove()

    return res.status(204).json({
        success: true,
        data: null
    })

})