const mongoose = require("mongoose");
const uri = "mongodb+srv://ryan:printers@printers.zmusdxg.mongodb.net/Printers";
const https = require('https');

const Printer = require("./models/Printer");


mongoose.connect(uri)
  .then(() => console.log("Mongoose connected"))
  .catch(err => console.error(err));

  mongoose.set('debug', true);



const fs = require('fs');
const readline = require('readline');
const bodyParser = require('body-parser');

const http = require("http");
const path = require("path");
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
const portNumber = 7000;

app.use(express.static('public'));

const database = "Printers";

let db;

app.set('view engine', 'ejs');
app.set("views", path.resolve(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.listen(portNumber, (err) => {
    if (err) {
        console.log("BOO!");
    } else {
        recursiveReader();
        console.log(`Web server started and running at http://localhost:${portNumber}`);
    }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});




function recursiveReader() {
    rl.question('Type stop to shutdown the server: ', (answer) => {

        if (answer == 'stop') {
            console.log("Shutting down the server");
            process.exit(0);
        }

        else {
            console.log(`Invalid command: ${answer}`);
            recursiveReader();
        }

    });
}



async function run() {
  try {


    //DOORBELL
    app.get('/', (req, res) => {
    res.render('index');
    });



  
  //DELETE ALL PRINTERS
  app.get('/delete', (req, res) => {
    res.render('delete');
  });

  app.post('/delete', async (req, res) => {
    try {
        await Printer.deleteMany({})
        console.log("Successfully deleted all printers from your database. Now sending you back to the main page...")
        res.redirect('/');
    } catch (err) {
        console.log(`Oops! We encountered an error: ${err}`)
    }

    
  });



  //ADD A PRINTER
  app.get('/add', (req, res) => {
    res.render('add');
  });

  app.post('/add', async (req, res) => {
    const printer = new Printer({
      nickname: req.body.nickname,
      brand: req.body.brand,
      model: req.body.model,
      trayMaxVolume: parseFloat(req.body.trayMaxVolume),
      backgroundinfo: req.body.backgroundinfo,
      submissionDate: new Date()
    });
    await printer.save();
  //res.send(`Successfully added a printer, with the nickname ${printer.printerName} on ${printer.submissionDate}`);
    let {nickname, brand, model, trayMaxVolume, backgroundinfo} = req.body;

    let answer = `<!DOCTYPE html><html><head>
	<meta charset="utf-8" />
	<title>Confirmation</title>
    <link rel="stylesheet" href="/css/style.css">
        </head>`;

    answer += "<h2>Printer Details</h2>";

    answer += "<b>Nickname: </b>" + nickname + "<br>";
    answer += "<b>Brand & Model:</b> " + brand + " " + model + "<br>";
    answer += "<b>Tray Max Volume: </b>" + trayMaxVolume + "<br>";
    answer += "<b>Background Information:</b>" + backgroundinfo + "<br>";
    answer += `<b>Task completed </b> ${printer.submissionDate} <br>`;
    answer += '<a href="/"><button type="text" class="homebutton">&#9664; HOME</button></a>';
    answer += `</body></html>`;

    res.send(answer);
    
  })


  //FIND A PRINTER
  app.get('/search', (req, res) => {
    res.render('search');
  });

  app.post('/search', async (req, res) => {
    let filter = { nickname: req.body.nickname };
    result = await Printer.findOne(filter);
    let answer = `<!DOCTYPE html><html><head>
	<meta charset="utf-8" />
	<title>Confirmation</title>
    <link rel="stylesheet" href="/css/style.css">
    </head><body>`;

    if (!result) {
        answer += 'Whoops! We have no printer using that nickname. Try again?<br> <a href="/search"><button type="text" class="homebutton">SEARCH</button></a>';
    } else {

    
    const {nickname, brand, model, trayMaxVolume, backgroundinfo} = result;

    console.log(result);
    

    answer += "<h2>Printer Details</h2>";

     answer += "<b>Nickname: </b>" + nickname + "<br>";
    answer += "<b>Brand & Model:</b> " + brand + " " + model + "<br>";
    answer += "<b>Tray Max Volume: </b>" + trayMaxVolume + "<br>";
    answer += "<b>Background Information:</b>" + backgroundinfo + "<br>";
    answer += '<a href="/"><button type="text" class="homebutton">&#9664; HOME</button></a>';
    answer += `</body></html>`;

    
    }
    res.send(answer);

  })
  

  } catch {

  }
}

//JOKE
app.get('/joke', async (req, res) => {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        const joke = await response.json();
        const {setup, punchline } = joke;
        res.render('joke', {setup, punchline });
    } catch (err) {
        console.error(err);
        res.status(500).send('Joke unavailable.');
    }
})

//SORT TO FIND OUT WHO IS THE SMARTEST
app.get('/sort', (req, res) => {
  res.render('sort')
})

app.post('/sort', async (req, res) => {
  const gpatosortby = parseFloat(req.body.gpa);
  let answer = "<h1>Applicants, sorted by GPA ≥ " + gpatosortby + "</h1>";
  answer += "<table border=1><thead><tr><th>Name</th><th>GPA</th></tr></thead><tbody>";
  
  

  const result = db.collection(database).find({gpa: {$gte: gpatosortby } }).sort({gpa: 1});
      let document = await result.next();
      while (document != null) {
         answer += "<tr><td>"+document.applicantName+"</td><td>"+document.gpa+"</td></tr>";
         document = await result.next();
      }

      answer += "</tbody></table>";

      answer += '<a href="/">HOME</a>';
      res.send(answer);
})

function confirming() {
  return confirm("Are you sure you want to submit?");

}

run().catch(console.dir);

