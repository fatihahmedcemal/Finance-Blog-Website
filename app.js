const express = require("express");
const app = express();
const mainRoute = require("./routes/index");
const mongoose = require("mongoose");

const User = require("./schemas/userSchema");
const Helper = require("./schemas/helperProfile");

// public 
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));

const { uri, keys_list } = require("./secret")

// mongodb 
mongoose.connect(uri);

const ejs = require("ejs");

// auth
const session = require("cookie-session");
const bcrypt = require("bcrypt");

app.use(
    session({
      name: 'session',
      keys: keys_list,
      resave: false,
      saveUninitialized: true,
      sameSite: 'lax',
      maxAge: null,
    })
);

app.use(async (req, res, next) => {
    console.log(req.session.userId);
    if (!req.session.userId) return next();
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.userId = null;
      return next();
    }
    if(user.role == "Helper") {
      const userProfile = await Helper.findOne({ email: user.email });
      if(userProfile) {
        req.userProfile = userProfile;
        res.locals.userProfile = userProfile;
        req.user = user;
        res.locals.user = user;
        return next();
      } else {
        req.userProfile = null;
        res.locals.userProfile = null;
        return next();
      } 
    } else {
      req.user = user;
      res.locals.user = user;
      return next();
    }
});

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false}));

const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

const chatSystem = require("./routes/chatSystem");

chatSystem(io);

const port = 80;

app.use("/", mainRoute);

server.listen(port, () => {
    console.log(`The app is running on port ${port}!`);
});

module.exports = server;