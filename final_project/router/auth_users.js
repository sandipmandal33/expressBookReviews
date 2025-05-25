const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    // Return true if any user with the same username is found, otherwise false
    return (userswithsamename.length > 0);
}

const authenticatedUser = (username,password)=>{ 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });

    // Return true if any valid user is found, otherwise false
    return (validusers.length > 0);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (!isbn) {
        return res.status(400).json({message: "Invalid ISBN"})
    }
    
    const review = req.query.review
    if (!review) {
        return res.status(400).json({message: "Invalid review"})
    }
    
    const currUser = req.session.authorization.username
    if (currUser) {
        books[isbn].reviews[currUser] = review
        console.log(books)  
        return res.status(200).json({message: "Review posted successfully"});
    }
    
    return res.status(400).json({message: "Unable to post review"});    
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (!isbn) {
        return res.status(400).json({message: "Invalid ISBN"});
    }

    const currUser = req.session.authorization.username;
    if (currUser) {
        delete books[isbn].reviews[currUser];
        console.log(books)
        return res.status(200).json({message: "Deleted review for " + currUser + " on ISBN " + isbn});
    } else {
        return res.status(400).json({message: "Error in request"});
    }    
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
