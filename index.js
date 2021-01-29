const app = require('express')()
const http = require('http').createServer(app)

const rooms = {};
const socketToRoom = {};

app.get('/', (req, res) => {
    res.send("My WebRTC Server -- ATN")
})

const socketio = require('socket.io')(http)

socketio.on("connection", (socket) => {
    console.log('connected ', socket.id);
    var roomId = null;

    socket.emit('connection-success', {
        success: socket.id,
    });

    socket.on("join room", (data) => {
        roomId = data["roomID"];
        var roomID = data["roomID"];
        if (rooms[roomID]) {
            const length = rooms[roomID].length;
            if (length === 2) {
                socket.emit("room full");
                return;
            }
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("online-peer", { otherUser: otherUser });
            socket.to(otherUser).emit("joined peers", { otherUser: socket.id });
        }
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = rooms[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            rooms[roomID] = room;
        }
        console.log(`${socket.id} has disconnected!`);
        delete socketToRoom[socket.id];
    });

    socket.on('offer', function (data) {
        const otherUser = rooms[roomId].find(id => id !== socket.id);
        if (otherUser) {
            socket.to(otherUser).emit("offer", {
                sdp: data["sdp"],
                socketID: data["local"],
                name: data["name"],
                pro_img: data["pro_img"],
            });
        }
    });

    socket.on('answer', function (data) {
        const otherUser = rooms[roomId].find(id => id !== socket.id);
        if (otherUser) {
            socket.to(otherUser).emit("answer", {
                sdp: data["sdp"],
                socketID: data["local"],
                name: data["name"],
                pro_img: data["pro_img"],
            });
        }
    });

    socket.on('candidate', (data) => {
        const otherUser = rooms[roomId].find(id => id !== socket.id);
        if (otherUser) {
            socket.to(otherUser).emit("candidate", {
                candidate: data["candidate"],
                socketID: data["local"],
            });
        }
    });
});

http.listen(process.env.PORT)


