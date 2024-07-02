if(process.env.NODE_ENV != "production"){
    require("dotenv").config()
}

const express = require("express")
const mysql = require("mysql2")
const ejsMate = require("ejs-mate")
const path = require("path")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid')
const passport = require("passport")
var LocalStrategy = require("passport-local").Strategy
const session = require('express-session')
const flash = require('connect-flash');


const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpessError.js")

const app = express()
const port = 8080

app.set("veiw engine", "ejs")
app.set("views", path.join(__dirname, "/views"))
app.engine("ejs", ejsMate)

app.use(express.urlencoded({extended: true}))

app.use(express.json())

//Session
const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}
app.use(session(sessionOptions))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
}).promise()

// Passport
// passport.use(new LocalStrategy( function(username, done){
//     connection.query("select * from userinfo where UserName='"+username+"'     ", function (err, user) {
//      if(err)
//      {s
//         return done(err);           
//      }
 
//      return done(null, user.id);     
//     })
//  }))

//  passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });
  
//   passport.deserializeUser(function(user, done) {
//   done(null, user.id);
//   });

// app.use((req, res, next) => {
//     res.locals.currUser = req.user
//     next()
// })

app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/signup", (req, res) => {
    res.render("./users/signup.ejs")
})

app.post("/signup", wrapAsync(async (req, res) => {
    const {username, email, password, user_type} = req.body;
    const q=`
    INSERT INTO users(user_id, username, email, password, user_type)
    VALUES(?, ?, ?, ?, ?)
    `
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await connection.query(q, [uuidv4(), username, email, hashedPassword, user_type])

    res.redirect("/login")
}))

app.get("/login", (req, res) => {
    res.render("./users/login.ejs")
})

app.post("/login", wrapAsync(async (req, res) => {
    const {username, password} = req.body
    const q = `
    SELECT password 
    FROM users
    WHERE username = ?
    `
    const [result] = await connection.query(q, [username])
    const passwordMatch = await bcrypt.compare(password, result[0].password)
    
    if(passwordMatch) {

    }
}))

app.get("/create", (req, res) => {
    res.render("/cars/create.ejs")
})

app.use((err, req, res, next) => {
    console.log(err)
    res.render("error.ejs", {err})
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})