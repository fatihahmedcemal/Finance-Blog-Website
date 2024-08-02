const socket = io();

const idInput = document.querySelector(".chat-id");
const chat = document.querySelector(".chat");

const url = document.querySelector(".url-input");

const messages = document.getElementById("messages");
const requestForm = document.querySelector(".meeting-request-form");
const requestButton = document.querySelector(".send-request");

const declineBtn = document.getElementById("decline-btn");
const acceptBtn = document.getElementById("accept-btn");

const sendBtn = document.querySelector(".send-btn");

const messageInput = document.querySelector(".message-input");

const saveChangesBtn = document.querySelector("#save-changes");
const date = document.querySelector(".date");
const time = document.querySelector(".time");
const timeframe = document.querySelector(".timeframe");


socket.on("message", (msg) => {
    var fullDate = '';
    if (msg.time && msg.timeframe) {
        const time = msg.time;
        const timeframe = msg.timeframe;
        fullDate = `&time=${time}&timeframe=${timeframe}`;
    } 
    // Get the input element by its id, assuming idInput is the id of the input element
    const idInput = document.querySelector(".chat-id");
    if (!idInput) {
        console.error("Error: idInput not found");
        return;
    }

    fetch(`/chat/new-message?id=${idInput.value}&content=${msg.content}&date=${msg.date}${fullDate}`, { method: "GET" })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            // Do something with the data if needed
            location.reload();
            chat.scrollTop = chat.scrollHeight;
        })
        .catch((err) => {
            console.error("Error during fetch:", err);
        });
});

socket.on("user-online", (msg) => {
    if(url.value == "/chat") return socket.emit("join-room", "chat room");
    socket.emit("join-room", url.value);
});

socket.on("request-accepted", (data) => {
    fetch(`/chat/request-accepted?id=${idInput.value}&date=${data.date}`, { method: "GET"}).then((data) => {
        socket.emit("chat-message", "User accepted the meeting request!");
    }).catch((err) => {
        console.log(err);
    });
});

socket.emit("url", url.value);

//sendBtn.addEventListener("click", sendMessage());

function sendMessage() {
    socket.emit("chat-message", messageInput.value);
}

const requestContainer = document.querySelector(".meeting-request-container");
if(requestContainer) requestButton.style.display = 'none';

if(requestButton) {
    requestButton.addEventListener("click", function() {
        requestForm.classList.toggle("hidden");
    });
}



function declineRequest() {
    declineBtn.disabled = true;
    acceptBtn.disabled = true;
    const message = "Request Declined!";
    socket.emit("meeting-declined", message);
    fetch(`/chat/delete-request?id=${idInput.value}`, { method: "GET"}).then(() => {
        console.log("It worked!");
    }).catch((err) => {
        console.log(err);
    });
};

function acceptRequest() {
    acceptBtn.disabled = true;
    declineBtn.disabled = true;
    const date = document.querySelector(".meeting-request-date").innerHTML;
    socket.emit("meeting-accepted", date);
    fetch(`/chat/delete-request?id=${idInput.value}`, { method: "GET"}).then(() => {
        console.log("It worked!");
    }).catch((err) => {
        console.log(err);
    });
}

if(saveChangesBtn) {
    saveChangesBtn.addEventListener("click", function() {
        requestForm.classList.toggle("hidden");
        var dateVar = date.value;
        var timeVar = time.value;
        var timeOfDay = timeframe.value;
        socket.emit("meeting-request", { dateVar, timeVar, timeOfDay });
        document.reload();
    });
}
