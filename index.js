import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(fileName);

app.use(bodyParser.urlencoded({ extended: true }));

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

app.post("/book/:id",async (req, res) => {
  const BookId = req.params.id;
  const bookData = `https://openlibrary.org/search.json?q=${BookId}`;

  let bookAuthor;
  let bookTitle;
  const bookCover = `https://covers.openlibrary.org/b/isbn/${BookId}-M.jpg`;
try {
    const result = await axios.get(bookData);
    bookTitle =  result.data.docs[0].title;
    bookAuthor = result.data.docs[0].author_name[0];

    res.render("bookPage.ejs", {
        bookTitle: bookTitle,
        BookId: BookId,
        bookAuthor: bookAuthor,
        bookCover: bookCover
    })

} catch (error) {
    console.error(error);
}
})


app.post("/bookAdded", async (req, res) => {
    console.log(req);
})