import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  password: "postgres",
  port: 5432,
  database: "shelfwise",
  host: "localhost",
});

db.connect();

const app = express();
const port = 3000;
const fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(fileName);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirName, "public")));
app.use("/css", express.static(path.join(__dirName, "css")));

app.listen(port, () => {
  console.log(`http://localhost:${3000}`);
});

//getting the root route.
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// getting the homepage
app.get("/homepage", async (req, res) => {
  let bookData;
  try {
    const query = await db.query("SELECT * FROM books");
    bookData = query.rows;
  } catch (error) {
    console.error("Homepage Error", error);
  }

  console.log(bookData);
  res.render("homepage.ejs", {
    bookData: bookData,
  });
});

app.post("/book/:id", async (req, res) => {
  const BookId = req.params.id;
  const bookData = `https://openlibrary.org/search.json?q=${BookId}`;
  let bookAuthor;
  let bookTitle;
  const bookCover = `https://covers.openlibrary.org/b/isbn/${BookId}-L.jpg`;
  try {
    const result = await axios.get(bookData);
    bookTitle = result.data.docs[0].title;
    bookAuthor = result.data.docs[0].author_name[0];

    res.render("bookPage.ejs", {
      bookTitle: bookTitle,
      BookId: BookId,
      bookAuthor: bookAuthor,
      bookCover: bookCover,
    });
  } catch (error) {
    console.error(error);
  }
});

app.post("/bookAdded", async (req, res) => {
  const bookCover = req.body.bookCover;
  const bookTitle = req.body.bookTitle;
  const bookAuthor = req.body.bookAuthor;
  const reviewText = req.body.reviewText;
  const bookAddOpt = req.body.bookAddOpt;
  const rating = req.body.rating;
  try {
    const query = await db.query(
      "INSERT INTO books (title, cover, author, reviewtext, rating) VALUES($1, $2, $3, $4, $5)",
      [bookTitle, bookCover, bookAuthor, reviewText, rating]
    );
  } catch (error) {
    console.error(error);
  }

  res.redirect("/homepage");
});


