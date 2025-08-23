const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/',  async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
        response.json(blogs)
    } catch (error) {
        next(error)
    }
})

// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }

blogsRouter.post('/', async (request, response, next) => {
    try {
        // const blog = new Blog(request.body)
        const { title, author, url, likes } = request.body
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }
        const user = await User.findById(decodedToken.id)
        const blog = new Blog({
            title, 
            author,
            url,
            likes,
            user: user._id
        })
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.status(201).json(savedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        const { id } = request.params
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) { 
            return response.status(401).json({ error: 'token missing or invalid' })
        } 
        const blog = await Blog.findById(id)
        if (blog.user.toString() !== decodedToken.id.toString()) {
            return response.status(401).json({ error: 'only the creator can delete a blog' })
        }
        await Blog.findByIdAndDelete(id)
        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const { title, author, url, likes } = request.body
    try {
        const { id } = request.params
        const blog = await Blog.findById(id);
        if (!blog) {
            return response.status(404).json({ error: 'Blog not found' })
        }
        blog.title = title
        blog.author = author
        blog.url = url
        blog.likes = likes
        const updatedBlog = await blog.save()
        return response.json(updatedBlog)
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter