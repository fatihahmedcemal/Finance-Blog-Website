const { io } = require("../app");
const socketio = require("socket.io");

function standardFunction(io) {
    io.on("connection", (socket) => {
        var roomName = false;

        socket.emit("user-online", "Welcome to Chat!");

        //socket.broadcast.emit('message', 'User is Online!');

        socket.on("join-room", (room) => {
            socket.join(room);
            roomName = room;
            console.log("join-room", room);
        });

        socket.on("chat-message", (msg) => {
            socket.emit("message", { content: msg, date: "" });
        });

        // meeting request
        socket.on("meeting-request", (data) => {
            console.log("Meeting is requested, the data: " + data.dateVar, data.timeVar, data.timeOfDay)
            socket.emit("message", { content: "Meeting Request", date: data.dateVar, time: data.timeVar, timeframe: data.timeOfDay });
        });

        socket.on("meeting-declined", () => {
            socket.emit("message", { content: 'User declined meeting request!' });
        });

        socket.on("meeting-accepted", (date) => {
            console.log("The date for accepted meeting is: " + date);
            socket.emit("request-accepted", { date: date });
        });

        socket.on("disconnect", () => {
            io.emit("user-offline", "User is offline!");
            socket.on("url", (room) => {
                socket.leave(room);
                roomName = null;
            })
        });
    });
}

module.exports = standardFunction;