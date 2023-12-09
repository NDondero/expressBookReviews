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
public_users.get('/', async function (req, res) {

    try {
        const data = await getBooks();
        res.send(JSON.stringify({ books }, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Could not retrieve books" });
    }
});

const getBooks = () => {
    return new Promise(resolve => {
        resolve(books);
    })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByIsbn(isbn)
        .then(book => res.status(200).send(book))
        .catch(msg => res.status(404).json({ message: msg }));
});

const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
        if (Object.keys(books).includes(isbn)) {
            resolve(books[isbn]);
        } else {
            reject('No book with such ISBN');
        }
    })
}

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        res.send(JSON.stringify({ booksByAuthor }, null, 4));
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        const booksByAuthor = {};
        Object.keys(books).forEach(key => {
            const book = books[key];
            if (book.author === author) {
                booksByAuthor[key] = book;
            }
        })
        if (Object.keys(booksByAuthor).length > 0) {
            resolve(booksByAuthor);
        } else {
            reject('No books with such author');
        }
    });
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then(booksByTitle => res.status(200).send(JSON.stringify({ booksByTitle }, null, 4)))
        .catch(msg => res.status(404).json({ message: msg }));
});

const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        const booksByTitle = {};
        Object.keys(books).forEach(key => {
            const book = books[key];
            if (book.title === title) {
                booksByTitle[key] = book;
            }
        });
        if (Object.keys(booksByTitle).length > 0) {
            resolve(booksByTitle);
        } else {
            reject('No books with such title');
        }
    });
}

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
