const express = require('express');
const axios = require('axios')
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
const getAllBooks = () => Promise.resolve(books)

public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    //res.send(JSON.stringify(books, null, 4));
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({message: "Unable to fetch all books" + error});
  }
});

// Get book details based on ISBN
const getBookByISBN = (isbn) => Promise.resolve(books[isbn]);

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const currBook = await getBookByISBN(isbn);
    if (currBook) {
        return res.status(200).json(currBook);
    } else {
        return res.status(404).json({message: "Book unavailable"});
    }
  } catch (error) {
    return res.status(500).json({message: "Unable to fetch book by ISBN" + error});
  }
//   res.send(books[isbn])
 });

// Get book details based on author
const getAllBooksByAuthor = (author) => {
    const finalDetails = new Map();

    for (isbn in books) {
        if (books[isbn].author === author) {
            finalDetails.set(isbn, books[isbn]);
        }
    }
    return finalDetails;
}

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const currBooksByAuthor = await getAllBooksByAuthor(author);
        if (currBooksByAuthor.size === 0 ) {
            return res.status(404).json({message: "Books by author unavailable"});
        } else {
            return res.status(200).json(Object.fromEntries(currBooksByAuthor));
        }
        // res.send(JSON.stringify(Object.fromEntries(finalDetails), null, 4))
    } catch (error) {
        return res.status(500).json({message: "Unable to fetch book by author" + error});
    }
});

// Get all books based on title
const getAllBooksByTitle = (title) => {
    const finalDetails = new Map();

    for (isbn in books) {
        if (books[isbn].title === title) {
            finalDetails.set(isbn, books[isbn]);
        }
    }
    return finalDetails;
}

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const currBooksByTitle = await getAllBooksByTitle(title);
        if (currBooksByTitle.size === 0 ) {
            return res.status(404).json({message: "Books by title unavailable"});
        } else {
            return res.status(200).json(Object.fromEntries(currBooksByTitle));
        }
    } catch (error) {
        return res.status(500).json({message: "Unable to fetch book by title" + error});
    }
    // res.send(JSON.stringify(Object.fromEntries(finalDetails), null, 4))
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn

    res.send(books[isbn].reviews)
});

module.exports.general = public_users;
