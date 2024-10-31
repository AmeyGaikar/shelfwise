import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(fileName);


app.use(express.static(path.join(__dirName, 'public')));
app.use('/css', express.static(path.join(__dirName, 'css')));

app.listen(port, () => {
    console.log(`http://localhost:${3000}`);
})

//getting the root route.
app.get("/", (req, res) => {
res.render("index.ejs");
})

// getting the homepage
app.get("/homepage", (req,res) => {
    res.render("homepage.ejs")
})



