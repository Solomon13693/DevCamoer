const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        validate: [validator.isURL, 'Please use a valid URL with HTTP or HTTPS']
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Email address is invalid']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must can not be more than 5']
    },
    averageCost: Number,
    image: {
        type: String,
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

BootcampSchema.pre(/^find/, function(next) {
    this.populate({ path: 'user', select: 'name email'})
    next()
})

BootcampSchema.pre('save', function (next) {
    const option = {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case, defaults to `false`
        strict: true,     // strip special characters except replacement, defaults to `false`
        trim: true
    }
    
    this.slug = slugify(this.name, option)
    next()
})

BootcampSchema.pre('remove', async function(next) {
    await this.model('Course').deleteMany({ bootcamp: this._id });
    next();
})

// BootcampSchema.virtual('courses', {
//     ref: 'Course',
//     localField: '_id',
//     foreignField: 'bootcamp',
//     justOne: false
// })

// BootcampSchema.pre('save', async function (req, res, next) {

//     const loc = await geocoder.geocode(this.address);
    
//     this.location = {
//         type: 'point',
//         coordinates: [loc[0].latitude, loc[0].longitude],
//         formattedAddress: loc[0].formattedAddress,
//         street: loc[0].street,
//         city: loc[0].city,
//         state: loc[0].state,
//         zipcode: loc[0].zipcode,
//     }

//     this.address = undefined

//     next()
// })

const Bootcamp = mongoose.model('Bootcamp', BootcampSchema)

module.exports = Bootcamp

