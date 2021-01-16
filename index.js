const app = require('express')()
const http = require('http').createServer(app)


app.get('/', (req, res) => {
    res.send("Node Server is running. Yay!!")
})

//Socket Logic
const socketio = require('socket.io')(http)

socketio.on("connection", (userSocket) => {

    userSocket.emit('connection-success', {
        success: userSocket.id
    })
    userSocket.on("send_message", (data) => {
        userSocket.broadcast.emit("receive_message", data)
    })
})

http.listen(process.env.PORT)


