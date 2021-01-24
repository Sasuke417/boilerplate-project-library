/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose=require("mongoose");

mongoose.connect(process.env.DB,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useFindAndModify:false
});

const db=mongoose.connection;

db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>console.log("Database Connection established!"));

const Schema=mongoose.Schema;
const bookSchema=new Schema({
  title: {type: String, required: true},
  commentcount: Number,
  comments: Array
});

const Book=mongoose.model("Book",bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({},(err,docs)=>{
        if(err) console.error(err);
        res.json(docs);
      });
    })
    
    .post(function (req, res){
      let input = req.body;
      //response will contain new book object including atleast _id and title
      if(!input.title) res.send("missing required field title");
      else{
        let newBook = new Book({
          title:input.title,
          commentcount:0,
          comments:[]
        });
        newBook.save((err,data)=>{
          if(err) console.error(err);
          res.json({title:newBook.title,_id:newBook._id});
        })
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({},(err,docs)=>{
        if(err) console.error(err);
        res.send("complete delete successful");  
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById({_id:bookid},(err,doc)=>{
        if(err) console.error(err);
        if(!doc) res.send("no book exists");
        else res.json(doc);
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      Book.findById({_id:bookid},(err,doc)=>{
        if(err) console.error(err);
        if(!doc) res.send("no book exists");
        else if(!comment) res.send("missing required field comment");
        else{
          doc.comments.push(comment);
          doc.commentcount=doc.comments.length;
          doc.save((err,data)=>{
            if(err) console.error(err);
            res.json(doc);
          });
        } 
      });
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if(!bookid) res.send("no book exists");
      else{
        Book.findByIdAndRemove(bookid,(err,doc)=>{
          if(err) console.error(err);
          if(!doc) res.send("no book exists");
          else res.send("delete successful");
        })
      }
    });
  
};
