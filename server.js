const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').Server(app);
app.use(cors());

app.use(express.json());

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const rooms = new Map();

app.get('/rooms', (req, res) => {
    res.json(rooms);
});

app.post('/rooms', (req, res) => {
    const { roomId } = req.body;
    if (!rooms.has(roomId)) {
        rooms.set(
            roomId,
            new Map([
                ['users', new Map()],
                ['messages', []],
            ]),
        );
    }
    res.send();
});

io.on('connection', (socket) => {
    socket.on('ROOM:JOIN', ({ roomId, userName }) => {
        socket.join(roomId);
        rooms.get(roomId).get('users').set(socket.id, userName);
        const users = [...rooms.get(roomId).get('users').values()];
        socket.to(roomId).emit('ROOM:JOINED', users);
    });
    console.log('User connected', socket.id);
});

server.listen(9999, (error) => {
    if (error) {
        console.error('Error starting server:', error);
        throw Error(error);
    }
    console.log('Server is running on port 9999');
});
