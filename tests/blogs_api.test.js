const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper  = require('./test_helper')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

describe('testing blogs api', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    // const blogObjects = helper.initialBlogs
    //   .map(blog => new Blog(blog))
    // const promiseArray = blogObjects.map(blog => blog.save())
    // await Promise.all(promiseArray)

    await api
      .post('/api/users')
      .send({
        username: 'testuser',
        name: 'Test User',
        password: 'password123'
      })
    
    await api
      .post('/api/users') 
      .send({
        username: 'seconduser',
        name: 'Second User',
        password: 'password456'
      })

    const login1 = await api
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'password123'
      })

    const login2 = await api
      .post('/api/login')
      .send({
        username: 'seconduser',  
        password: 'password456',
      }) 

    await api
      .post('/api/blogs') 
      .set('Authorization', `Bearer ${login1.body.token}`)
      .send(helper.initialBlogs[0])

    await api
      .post('/api/blogs') 
      .set('Authorization', `Bearer ${login2.body.token}`)
      .send(helper.initialBlogs[1])
  })
  describe('tests for getting blogs', () => {
    test('notes are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
  })
    test('blogs have id field and not _id', async () => {
      const response = await helper.allBlogsInDb()
        response.forEach(blog => {
            expect(blog.id).toBeDefined()
            expect(blog._id).toBeUndefined()
        })
    })
  })
  describe('tests for adding blogs', () => {
    test('a valid blog can be added', async () => {
      const login = await api
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
      expect(login.body.token).toBeDefined()
      const token = login.body.token

      const newBlog = {
        title: "New blog", 
        author: "John Doe",
        url: "http://example.com/new-blog",
        likes: 15
      } 
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.allBlogsInDb()
      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
      expect(blogsAtEnd[blogsAtEnd.length - 1].title).toBe(newBlog.title)
      //assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      //assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].title, newBlog.title);
    })
    test('blog without likes defaults to 0', async () => {
      const login = await api
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
      expect(login.body.token).toBeDefined()
      const token = login.body.token

      const newBlog = {
        title: "Blog without likes",  
        author: "Jane Doe",
        url: "http://example.com/blog-without-likes",
      }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/) 
            
        const blogsAtEnd = await helper.allBlogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
        expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
        // assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        // assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
    })
    test('blog without title returns 400', async () => {
      const login = await api
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
      expect(login.body.token).toBeDefined()
      const token = login.body.token

      const newBlog = {
        author: "John Doe",
        url: "http://example.com/no-title",
        likes: 10
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })
    test('blog without url returns 400', async () => {
       const login = await api
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
      expect(login.body.token).toBeDefined()
      const token = login.body.token

      const newBlog = {
        title: "No URL Blog",
        author: "Jane Doe",
        likes: 5
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })
  }) 
  describe('tests for deleting blogs', () => {
    test('a blog can be deleted with proper user', async () => {
      const blogsAtStart = await helper.allBlogsInDb()
      const blogToDelete = blogsAtStart[0]

      const login = await api
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
      expect(login.body.token).toBeDefined()
      const token = login.body.token
      console.log('blog to delete:', blogToDelete)
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.allBlogsInDb()
      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length - 1)
      // assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const ids = blogsAtEnd.map(b => b.id)
      expect(ids.includes(blogToDelete.id)).toBe(false)
      // assert.deepStrictEqual(ids.includes(blogToDelete.id), false)
    })
    test('deleting a blog without token is properly handled', async () => {
      const blogsAtStart = await helper.allBlogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401)
    })
    test('deleting a blog with wrong user is properly handled', async () => {
      const blogsAtStart = await helper.allBlogsInDb()
      const blogToDelete = blogsAtStart.find(b => b.title === helper.initialBlogs[0].title)
      expect(blogToDelete).toBeDefined()

      const login = await api
        .post('/api/login')
        .send({
          username: 'seconduser',
          password: 'password456'
        })

      const token = login.body.token
      expect(token).toBeDefined()

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
    })
  })
  describe('tests for updating blogs', () => {
    test('a blog can be updated', async () => {
      const blogsAtStart = await helper.allBlogsInDb()
      const blog = blogsAtStart[1]

      const editedBlog = {...blog, likes: 150}
       const login = await api
        .post('/api/login')
        .send({
          username: 'seconduser',
          password: 'password456'
        })

      const token = login.body.token
      expect(token).toBeDefined()

      const response = await api
      .put(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(editedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

      // assert.strictEqual(response.body.likes, 150);
      expect(response.body.likes).toBe(150)

      const blogsAtEnd = await helper.allBlogsInDb();
      const updatedBlog = blogsAtEnd.find(b => b.id === blog.id)
      // assert.strictEqual(updatedBlog.likes, 150)
      expect(updatedBlog.likes).toBe(150)
    })
    test('trying to update a blog with invalid id is properly handled', async () => {
      const blogsAtStart = await helper.allBlogsInDb()
      const blog = blogsAtStart[0]

      const badId = await helper.nonExistingId()

      const editedBlog = {...blog, likes: 150}
      const response = await api
      .put(`/api/blogs/${badId}`)
      .send(editedBlog)
      .expect(404)
      .expect('Content-Type', /application\/json/);

      expect(response.body.error).toBe('Blog not found')
    })
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })
})