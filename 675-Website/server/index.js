const express = require("express");
const mysql = require("mysql2");
const cors = require('cors')
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

//Creating connection
//Input own password in a .env file
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB,
});

//connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Mysql Connected...");
});

app.use(cors());
app.use(express.json())

app.post("/create", (req,res) => {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const address = req.body.address;
    const username = req.body.username;
    const password = req.body.password;
    const user_id = req.body.userId;

    let sql = "INSERT INTO User (user_id,name,email,mobile,address,username,password) VALUES(?,?,?,?,?,?,?)"
    db.query (sql,[user_id,name,email,mobile,address,username,password],(err,result) => {
        if(err) throw err;
        res.send("Values Inserted");
    })
})
//Queries
app.get('/users', (req,res) => {
    let sql = "SELECT * FROM user";
    db.query(sql,(err,result) => {
        if (err) throw err;
        res.send(result);
    })
})
app.get("/query1", (req, res) => {
    console.log("Group by & Having Queries")
    let userIssueBooks = `select count(*)
    from Borrows
    Group by book_id
    Having book_id= 1;`;
    db.query(userIssueBooks, (err, result) => {
        if (err) throw err;
        let text = "Finding number of users who issued a book with book id 1";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query2", (req, res) => {
    console.log("Group by & Having Queries")
    let nameOfBookBorrowed = `select title from Books where
    book_id in (
    Select book_id from Borrows
    Group by book_id
    Having count(book_id) = 1);`;
    db.query(nameOfBookBorrowed, (err, result) => {
        if (err) throw err;
        let text = "Finding the name of books borrowed exactly once";
        res.json({
            Query: text,
            result: result
        })
    });

});
app.get("/query3", (req, res) => {
    //Nested Queries
    let bookTitlesOnShelf2 = `select Books.title
    from Books
    where book_id IN (
    select book_id
    from Belongs_to
    where shelf_id = 2);`;
    db.query(bookTitlesOnShelf2, (err, result) => {
        if (err) throw err;
        let text = "1.Names of book titles on shelf 2";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query4", (req, res) => {
    let usersWhoHaventBorrowedBooks = `select User.name
    from User
    where User.user_id NOT IN (
    Select distinct(user_id)
    from Borrows );`;
    db.query(usersWhoHaventBorrowedBooks, (err, result) => {
        if (err) throw err;
        let text = "2.Names of users that have not borrowed a book";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query5", (req, res) => {
    let listOfAvaliableBooks = `Select * from Books where book_id not in (select book_id from Borrows where return_date is
        NULL);`;
    db.query(listOfAvaliableBooks, (err, result) => {
        if (err) throw err;
        let text = "3.Find the list of books available for borrowing";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query6", (req, res) => {
    let countOfSpecificBorrowedBooks = `Select Count(*) from books where book_id in (select b.book_id from User u, Borrows b
        Where u.user_id = b.user_id
        Group by u.name
        Having u.name = "Larry M. Sutter");`;
    db.query(countOfSpecificBorrowedBooks, (err, result) => {
        if (err) throw err;
        let text = "4. Find the count of books borrowed by ‘Larry M. Sutter’ till date";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query7", (req, res) => {
    let countOfBorrowedBooksEachYear = `select u.name,count(*) from Borrows b
    join User u
    on u.user_id = b.user_id
    Where YEAR(issue_date) = 2022
    Group by b.user_id;`;
    db.query(countOfBorrowedBooksEachYear, (err, result) => {
        if (err) throw err;
        let text = "5. Find the number of books borrowed by each user in current year";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query8", (req, res) => {
    let listOfUsersWhoHaventBorrowedBooks = `Select * from User where user_id not in (select user_id from borrows);`;
    db.query(listOfUsersWhoHaventBorrowedBooks, (err, result) => {
        if (err) throw err;
        let text = "6. Find the user list which have not borrowed any book till date";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query9", (req, res) => {
    let publisherOfAllBooks = `Select b.title, p.name
    from Books b, Publishes pub, Publisher p
    Where b.book_id = pub.book_id and p.publisher_id = pub.publisher_id;`;
    db.query(publisherOfAllBooks, (err, result) => {
        if (err) throw err;
        let text = "7. Find the publisher of all books";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query10", (req, res) => {
    let authorOfAlgorithmDesign = `Select author
    from Books
    where title = "Algorithm Designs";`;
    db.query(authorOfAlgorithmDesign, (err, result) => {
        if (err) throw err;
        let text = "8. Find the author of the book “Algorithm Designs”";
        res.json({
            Query: text,
            result: result
        })
    });
});

app.get("/query11", (req, res) => {
    let listOfBooksOnShelf3 = `Select * from Books where book_id in (select book_id from Belongs_to where shelf_id = "3");`;
    db.query(listOfBooksOnShelf3, (err, result) => {
        if (err) throw err;
        let text = "9. List the books which are placed on shelf 3";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query12", (req, res) => {
    let numberOfBooksOnEachShelf = `Select shelf_id, count(*) from Belongs_to
    Group by shelf_id;`;
    db.query(numberOfBooksOnEachShelf, (err, result) => {
        if (err) throw err;
        let text = "10. Find the number of books placed on each shelf:";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query13", (req, res) => {
    let shelfWithMaxNumberOfBooks = `Select shelf_id, count(book_id) as num
    From Belongs_to
    Group by shelf_id
    Order by num DESC
    LIMIT 1;`;
    db.query(shelfWithMaxNumberOfBooks, (err, result) => {
        if (err) throw err;
        let text = "11. Find the shelf having max number of books";
        res.json({
            Query: text,
            result: result
        })
    });
});
app.get("/query14", (req, res) => {
    let findFacultyUsers = `Select user_id, name
    from User
    where user_id in
    (select user_id from Faculty);`;
    db.query(findFacultyUsers, (err, result) => {
        if (err) throw err;
        let text = "12. Find the faculty users:";
        res.json({
            Query: text,
            result: result
        })
    });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
