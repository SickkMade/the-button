const express = require('express');
const { appendFile } = require('fs');
const app = express();
const PORT = 8000;
const MongoClient = require("mongodb").MongoClient
require('dotenv').config()
const session = require('express-session')
const methodOverride = require('method-override')
const maxScore = 0;

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

app.get('/', async(req, res) => {
    await db.collection(dbName).deleteMany({}); //IMPORTANT USE FOR ONLY DEBUGGING
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
        //db.collection(dbName).findOne({'sessionId':req.session.userId})
        //req.session.userId for find
        
        res.render('login.ejs')
    } else{
        res.redirect('/press')
    }
})

app.get('/press', async (req, res) => {
    
    res.render('index.ejs', {currentScore: req.session.score, maxScore: maxScore})
})
app.put('/updateButtonCount', async (req,res) => {
    newScore = 0 //create variable


    //if we dont have a score then lets create one!
    if(!req.session.score) {
        newScore = 1
    } else {
        if(checkIfPass()){ //check the 1/5 odds
            newScore = ++req.session.score
        }else { //if we fail
            newScore = 1

            //set max score to your new max score if max
            const currentUser = await db.collection(dbName).findOne({_id: req.session.userId})
            
            
            if(currentUser.maxScore < req.session.score){
                db.collection(dbName).updateOne({_id: req.session.userId}, { //set to new max score
                    $set: {
                        maxScore: req.session.score
                    }
                },
                {
                    upsert: false
                })
            }
            
            //upadate max update label
            maxScore = req.session.score //maybe dont have this global LOL
        }
        
    }
    req.session.score = newScore //increase or set score



    //return the score to the client
    res.json({
        'score': req.session.score,
        'maxScore': maxScore
    })

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

function checkIfPass(){
    return Math.random()*5 < 1 ? false : true
}

app.listen(PORT);