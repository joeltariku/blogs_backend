const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    const maxLikes = mostLikes(blogs)
    const favorite = blogs.find(blog => blog.likes === maxLikes)
    return favorite
}

const mostLikes = (blogs) => {
    return blogs.reduce((max, blog) => {
        return Math.max(max, blog.likes)
    }, 0)
}




module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}