const express = require('express');
const { appendFile } = require('fs');
const app = express();
const PORT = 8000;
const MongoClient = require("mongodb").MongoClient
require('dotenv').config()
const session = require('express-session')
const methodOverride = require('method-override')

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'button'

MongoClient.connect(dbConnectionStr)
.then(client => {
    console.log(`Connected to ${dbName} Database`)
    db = client.db(dbName) //connect to db
})

app.use(methodOverride('_method'));
app.set('view engine', 'ejs')
app.use(express.static('public')) //figure out this bullshit pls
app.use(express.json())
app.use(session({
    secret:'secret-key',
    resave: false,
    saveUninitialized: false,
    
}))

app.get('/', (req, res) => {
    if(!req.session.userId){
        const user = {
            'username': 'User',
            'maxScore': 0
        }
        
        req.session.userId = db.collection(dbName).insertOne(user)._id;
        
        //db.collection(dbName).findOne({'sessionId':req.session.userId})
        //req.session.userId for find
        
        res.render('login.ejs')
    } else{
        res.redirect('/press')
    }
})

app.get('/press', async (req, res) => {
    
    res.render('index.ejs', {currentScore: req.session.score})
})
app.put('/updateButtonCount', (req,res) => {
    newScore = 0
    if(!req.session.score) {
        newScore = 1
    } else {
        newScore = ++req.session.score
    }
    req.session.score = newScore
    res.json({
        'score': req.session.score
    })
})
app.get('/didWePass', (req, res) => {
    const answer = true
    if(Math.random() * 5 < 1){
        answer = false
    }
    res.send(answer)
})
app.put('/changeUsername', (req, res) => {
    
    db.collection(dbName).updateOne({'sessionId':req.session.id}, {
        $set: {
            username: req.body.username
        }
    },
    {
        upsert: false
    })
    res.redirect('/press')
})

app.listen(PORT);