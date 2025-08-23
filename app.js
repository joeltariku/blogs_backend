const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blog')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

logger.info('Connecting to MongoDB')

mongoose.connect(config.MONGODB_URI).then(() => {
    logger.info('Connected to MongoDB')
}).catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
});


app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.token)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
