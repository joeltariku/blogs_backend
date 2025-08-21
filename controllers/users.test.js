const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper  = require('../tests/test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)
const User = require('../models/user')

describe('user controller tests', () => {
    beforeEach(async () => {
        await User.deleteMany()
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })
    describe('getting users', () => {
        test('successfully gets all users', async () => {
            await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        })
    })
    describe('adding users', () => {
        test('successfuly creates new user with satisified requirements', async () => {
            const usersAtStart = await helper.allUsersInDb()
            const newUser = {
                username: "DaPrez",
                name: "Obama",
                password: "Imdagoat"
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.allUsersInDb()
            expect(result.body.username).toBe(newUser.username)
            expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
        })
        test('fails to post user with missing password', async () => {
            const usersAtStart = await helper.allUsersInDb()
            const newUser = {
                username: "DaPrez",
                name: "Obama"
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toBe('password missing')
            const usersAtEnd = await helper.allUsersInDb()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })
        test('fails to post user with password less than three characters', async () => {
            const usersAtStart = await helper.allUsersInDb()
            const newUser = {
                username: "DaPrez",
                name: "Obama",
                password:"Im"
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            
            expect(result.body.error).toBe('password must be at least 3 characters')
            const usersAtEnd = await helper.allUsersInDb()
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })
    })
    afterAll(async () => {
        await mongoose.connection.close()
    })
})