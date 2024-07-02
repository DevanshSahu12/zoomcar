const express = require("express")
const mysql = require("mysql2")
const ejsMate = require("ejs-mate")
const path = require("path")

const app = express()
const port = 8080

app.set("veiw engine", "ejs")
app.set("views", path.join(__dirname, "/views"))
app.engine("ejs", ejsMate)

app.use(express.urlencoded({extended: true}))

app.use(express.static(path.join(__dirname, "/public")))

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "zoomcar",
    password: "mysql7410"
})

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/signup", (req, res) => {
    res.render("./users/signup.ejs")
})

app.post("/signup", (req, res) => {
    const {username, email, password, user_type} = req.body;
    const q=`
    INSERT INTO users(username, email, password, user_type)
    VALUES(?, ?, ?, ?)
    `;
    const result = connection.query(q, [username, email, password, user_type])
    console.log(result[0])
    res.redirect("/")
})

app.get("/login", (req, res) => {
    res.render("./users/login.ejs")
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})