//jshint esversion:6
//require npm modues

const http = require('http');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const alert = require('alert');
// const _ = require("lodash");


const app = express();

const parseUrl = express.urlencoded({ extended: false, sub:"false" });
const parseJson = express.json({ extended: false });
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;


//EJS started
app.set('view engine', 'ejs');
// bdoy-parser started
// app.use(bodyParser.urlencoded({extended: true}));

// start for public folder of ejs modual for css and image folder and views for html files
app.use(express.static("public"));

app.get("/", function(req , res){
  res.render("index");
});
app.get("/send", function(req , res){
  Member.find({},function(err,found){
     if(err){
       console.log(err);
     }else{
       // console.log(found);
        res.render("send", {
          member: found
         });
     }
  });
  // res.render("send");
});
// database Schema
const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: Number,
  amount: Number,
  // status: String
});
// initialise Schema
const Member = mongoose.model('Member', memberSchema);



app.get("/about", function(req , res){
  res.render("about");
});
app.get("/reciver", function(req , res){

  Member.find({},function(err,found){
     if(err){
       console.log(err);
     }else{
       console.log(found);
       // console.log(found);
        res.render("reciver", {
          Email: found
         });
     }
  });
});
app.get("/contact", function(req , res){
  res.render("contact");
});
app.get("/new", function(req , res){
  res.render("new");
});
app.get("/sendmoney", function(req , res){
  res.render("sendmoney");
});
app.get("/transaction", function(req , res){
  Transaction.find({},function(err,found){
     if(err){
       console.log(err);
     }else{
       // console.log(found);
        res.render("transaction", {
          alltransaction: found
         });
     }
  });
  // res.render("transaction");
});



app.get("/:postName", function(req, res){
  const requestedTitle = req.params.postName;
  //onsole.log(requestedTitle);

  Member.findOne({email: requestedTitle },function(err,post){
    if(err){
      console.log(err);
    }else{
      console.log(post);
      var newemail=post.email;
      console.log(newemail);
      Transaction.find({SenderEmail : newemail},function(err,history){
        console.log(history);
        res.render("member",{
          Name:post.name,
          Email:post.email,
          Amount:post.amount,
          alltransaction:history
        });
      });
      //console.log(post);

    }

  });
});




//<-------------------------database------------------------------------>
//mongoose database started for mongodb atlas conection
mongoose.connect('mongodb+srv://admin-Anubhav:test123@cluster0.y1md9.mongodb.net/BankDB', {useNewUrlParser: true, useUnifiedTopology: true});



//database connected
const db = mongoose.connection;
// checking for connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("successfully connected");
});
// database Schema
const transactionSchema = new mongoose.Schema({
  SenderEmail: String,
  RecicerEmail: String,
  AmountSend: Number,
  status:String,
  // status: String
});
// initialise Schema
const Transaction = mongoose.model('Transaction', transactionSchema);












app.post("/new",[parseUrl, parseJson],function(req,res){

  const member = new Member({
  name: req.body.name,
  email:req.body.email,
  number:req.body.phone,
  amount:req.body.amount
  });
  member.save();
  res.redirect("/send");
});

app.post("/reciver",[parseUrl, parseJson],function(req,res){
  const senderemail= req.body.Semail;
  const reciveremail= req.body.Remail;
  var value= Number(req.body.amount);
  // console.log(senderemail);
  var Status ="Success";

  Member.findOne({email:senderemail},function(err,item){
    if(!item){
      console.log("empty");
    }else{
      console.log(item.amount);
      var newamount=Number(item.amount-value);
      console.log(newamount);
      Member.updateOne({email:senderemail},{$set: { amount: newamount}},function(err,res){
        if(err){
          console.log(err);
        }else{
          console.log("updates");
          Status="Success";
        }
      });
    }
  });

  Member.findOne({email:reciveremail},function(err,items){
    if(!items){
      console.log("empty");
    }else{
      console.log(items.amount);
      var reciveramount=Number(items.amount + value);
      // console.log(reciveramount);
      Member.updateOne({email:reciveremail},{$set: { amount: reciveramount}},function(err,res){
        if(err){
          console.log(err);
        }else{
          console.log("updated");
          Status="Success";
        }
      });
      const transaction= new Transaction({
        SenderEmail: req.body.Semail,
        RecicerEmail: req.body.Remail,
        AmountSend: Number(req.body.amount),
        status:Status,
      });
      transaction.save();
    }
  });
  res.redirect("/send");
});






app.listen(PORT, function(){
  console.log("server started at port "+ PORT);
});
