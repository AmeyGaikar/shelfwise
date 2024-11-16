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
      "INSERT INTO books (title, cover, author, reviewtext, rating, bookaddopt) VALUES($1, $2, $3, $4, $5, $6)",
      [bookTitle, bookCover, bookAuthor, reviewText, rating, bookAddOpt]
    );
  } catch (error) {
    console.error(error);
  }

  res.redirect("/homepage");
});

app.post("/edit", async (req, res) => {
  console.log(req.body);

  const review = req.body.editedReview;
  const trackOption = req.body.bookAddOpt;
  const rating = req.body.editedRating;
  const postId = parseInt(req.body.postId);

  try {
    const query = await db.query(
      " UPDATE books SET (reviewtext, rating, bookaddopt) = ($1, $2, $3) WHERE id=$4",
      [review, rating, trackOption, postId]
    );

    res.redirect("/homepage");
  } catch (error) {
    console.error(error);
  }
});

app.post("/delete", async (req, res) => {
  console.log(req.body);
  const id = req.body.deletePostId;
  try {
    const query = await db.query(" DELETE FROM books WHERE id=$1", [id]);

    res.redirect("/homepage");
  } catch (error) {
    console.error(error);
  }
});
