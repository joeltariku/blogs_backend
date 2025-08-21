const usersRouter = require('express').Router()
const BlogUser = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await BlogUser.find({})
        res.json(users)
    } catch (error) {
        next(error)
    }
})

usersRouter.post('/', async (req, res, next) => {
    const { username, name, password } = req.body

    if (!password) {
        return res.status(400).json({ error: 'password missing' })
    } else if (password.length < 3) {
        return res.status(400).json({ error: 'password must be at least 3 characters' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new BlogUser({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
})

module.exports = usersRouter