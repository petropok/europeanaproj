const express = require("express")
const app = express()
const PORT = 3000
const router = require("./routes");

app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs")
app.use(express.json());

//Use external routes
app.use("/", router);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});