const express = require('express');
const axios = require('axios');
const books = require("./booksdb.js");
const isValid = require("./auth_users.js").isValid;
const users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            const newUser = {
                username: username,
                password: password
            }
            users.push(newUser);
            return res.status(201).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Bad request" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify({ books }, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const booksByAuthor = {};
    const author = req.params.author;
    Object.keys(books).forEach(key => {
        const book = books[key];
        if (book.author === author) {
            booksByAuthor[key] = book;
        }
    })
    res.send(JSON.stringify({ booksByAuthor }, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const booksByTitle = {};
    const title = req.params.title;
    Object.keys(books).forEach(key => {
        const book = books[key];
        if (book.title === title) {
            booksByTitle[key] = book;
        }
    })
    res.send(JSON.stringify({ booksByTitle }, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
