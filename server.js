const express = require('express');
const { appendFile } = require('fs');
const { ObjectId } = require('mongodb');
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
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    
}))

app.get('/', async(req, res) => {
    //await db.collection(dbName).deleteMany({}); //IMPORTANT USE FOR ONLY DEBUGGING
    if(!req.session.userId){
        const user = {
            'username': 'User',
            'maxScore': 0
        }


        const result = await db.collection(dbName).insertOne(user);

        if (result.acknowledged) {
            req.session.userId = result.insertedId;
        } else{
            console.error("user sessioin failed")
        }
    }
    res.render('login.ejs')
})

app.get('/press', async (req, res) => {

    //if user does not exist
    if(!req.session.userId){
        res.redirect('/')
    }

    //creates an array of the top ten scores
    const leaderboard = await db.collection(dbName).aggregate([
        { $group: { _id: null, scores: { $push: {maxScore: "$maxScore", username:"$username" } } } },
        { $unwind: "$scores" },
        { $sort: { "scores.maxScore": -1 } },
        { $limit: 25 }
      ]).toArray();

    res.render('index.ejs', {currentScore: req.session.score, maxScore: req.session.maxScore, leaderboard: leaderboard})
})
app.put('/updateButtonCount', async (req,res) => {
    let newScore = 0 //create variable
    let didFail = false

    //if we dont have a score then lets create one!
    if(req.session.score == null) {
        newScore = 1
        req.session.maxScore = 1
    } else {
        if(checkIfPass()){ //check the 1/5 odds
            newScore = ++req.session.score
        }else { //if we fail
            didFail = true
            newScore = 0
        }


        //set max score to your new max score if max
        const currentUser = await db.collection(dbName).findOne({_id: ObjectId.createFromHexString(req.session.userId)}) //i use the same long id twice maybe fix?
        //check/update maxscore   
        if(currentUser.maxScore < req.session.score){

            db.collection(dbName).updateOne({_id: ObjectId.createFromHexString(req.session.userId)}, { //set to new max score
                $set: {
                    maxScore: req.session.score
                }
            },
            {
                upsert: false
            })
            currentUser.maxScore = req.session.score
            req.session.maxScore = req.session.score
        }
        
    }
    req.session.score = newScore //increase or set score



    //return the score to the client
    res.json({
        'score': req.session.score,
        'maxScore': req.session.maxScore,
        'didFail': didFail
    })

})

app.put('/changeUsername', (req, res) => {
    const newUsername = req.body.username

    db.collection(dbName).updateOne({_id: ObjectId.createFromHexString(req.session.userId)}, {
        $set: {
            username: newUsername
        }
    },
    {
        upsert: false
    })
    res.redirect('/press')
})

function checkIfPass(){
    return Math.random()*5 < 1 ? false : true
}

app.listen(PORT);