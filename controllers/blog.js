const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/',  async (request, response, next) => {
    try {
        const blogs = await Blog.find({})
        response.json(blogs)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    try {
        const blog = new Blog(request.body)
        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        const { id } = request.params
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