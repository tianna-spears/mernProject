const User = require('../models/User')
const Note = require('../models/Note')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


// Get All Users; GET /users Route; Private Access
const getAllUsers = asyncHandler (async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) {
        return res.status(400).json({ message: 'No users found '})
    }
    res.json(users)
})



// Create a New User; POST /users Route; Private Access
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

// Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

// Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    if(duplicate) {
        return res.status(409).json({ message: 'Duplicate username'})
    }
// Hash password
    const hashedPassword = await bcrypt.hash(password, 10) // bcrypt salt rounds here
    const userObject = { username, "password": hashedPassword, roles}

// Create and store new user
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({ message: `New user ${username} created!`})
    } else {
        res.status(400).json({ message: 'Invalid user data received'})
    }
})



// Update; GET /users Route; Private Access
const updateUser = asyncHandler(async (req,res) => {
    const { id, username, roles, active, password } = req.body

// Confirm data
if (!id || !username || !Array.isArray(roles) || !roles.length || 
typeof active !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required.'})
}

// Define user
const user = await User.findById(id).exec()
    if(!user) {
        return res.status(400).json({ message: 'User not found'})
}

// Check for duplicate
const duplicate = await User.findOne({ username }).lean().exec()
// Allow updates to the original user
if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username' })
}

// Update user
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password update
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()
    res.json({ message: `${updatedUser.username} updated`})
})



// Update; GET /users Route; Private Access
const deleteUser = asyncHandler(async (req,res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).json({ message: 'User ID required'})
    }

    const note = await Note.findOne( { user: id }).lean()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes'})
    }

    const user = await User.findById(id)
    if(!user) {
        return res.status(400).json({ message: 'User not found.'})
    }

    await user.deleteOne()

    const reply = `Username ${user.username} with ID ${user._id} deleted`

    res.json(reply)
})


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}