require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')

const PORT = process.env.PORT || 5000;

// middleware
// app.use(express.json())

// routes

app.use('/', express.static(path.join(__dirname, '/public')))
app.use('/', require('./routes/root.js'))

app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})