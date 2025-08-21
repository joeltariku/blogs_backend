const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: "All or nothing",
        author: "Arsenal F.C.",
        url: "https://www.arsenal.com/",
        likes: 100
    },
    {
        title: "The beautiful game",
        author: "FIFA",
        url: "https://www.fifa.com/",
        likes: 200
    }
]

const nonExistingId = async () => {
    const blog = new Blog({ 
        title: "All or nothing",
        url: "https://arsenal.com",
        likes: 1234
    })  
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const allBlogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const allUsersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    nonExistingId,
    allBlogsInDb,
    allUsersInDb
}