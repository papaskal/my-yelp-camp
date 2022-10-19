const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/campground')
const Review = require("./models/review")
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})


const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


app.listen(3000, () => {
    console.log('Serving on port 3000')
})

app.use('/campgrounds/:id/reviews', reviews)
app.use('/campgrounds', campgrounds)


app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err
    if (!err.message) err.message = "Oh no, something went Wrong!"
    res.status(statusCode).render('error', { err })
})