const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");
const regd_users = express.Router();

const users = [
    {
        "username": "ndondero",
        "password": "pwd123"
    }
];

const isValid = (username) => {
    const usernameInUse = users.filter(user => {
        return user.username === username;
    });
    if (usernameInUse.length > 0) {
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username, password) => {
    const validUser = users.filter(user => {
        return (user.username === username && user.password === password);
    });
    if (validUser.length > 0) {
        return true;
    } else {
        return false;
    }
}

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.query.review;
    const isbn = req.params.isbn;
    if (!review) {
        return res.status(400).send("Review not provided");
    }
    const book = books[isbn];
    if (!book.reviews) {
        book.reviews = {};
    }
    const username = req.session.authorization.username;
    if (book.reviews[username]) {
        book.reviews[username] = review;
        return res.status(200).send("Review successfully modified");
    } else {
        book.reviews[username] = review;
        return res.status(200).send("Review successfully added");
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    const username = req.session.authorization.username;
    if (book) {
        if (book.reviews[username]) {
            delete book.reviews[username];
            return res.status(200).send("Review successfully deleted");
        } else {
            return res.status(404).send("Review not found");
        }
    } else {
        return res.status(404).send("Book not found");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
