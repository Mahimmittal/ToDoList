const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _=require("lodash");
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-mahim:mahim2001@cluster0.ujx7o.mongodb.net/todolistDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Items", itemsSchema);
const item1 = new Item({
  name: "Welcome to your To-Do List."
});
const item2 = new Item({
  name: "Click the + button to add a new Item."
});
const item3 = new Item({
  name: "<-- Click this button to delete a new Item."
});
const defaultItems = [item1, item2, item3];
const listSchema=new mongoose.Schema({
  name : String,
  items : [itemsSchema]
});
const List= mongoose.model("lists",listSchema);
app.set('view engine', 'ejs');
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {

        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully saved default items to DB");
          }
        });
      }
      res.render('list', {
        listTitle: "Today",
        newListItem: foundItems
      });
    }

  });

});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name : customListName},function(err,result){
    if(result){
      // Show the existing list
      res.render('list', {
        listTitle: result.name,
        newListItem: result.items
      });
    }
    else{
      // Create a new list

      const list=new List({
        name : customListName,
        items: defaultItems
      });
      list.save();
      res.render('list', {
        listTitle: list.name,
        newListItem: list.items
      });
    }
  })


});
app.get("/about", function(req, res) {
  res.render('about', );
});
app.post("/", function(req, res) {

  let item = req.body.newItem;
  let listName = req.body.list;

  const newItem = new Item({
    name: item
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},function(err,result){
      result.items.push(newItem);
      result.save();
      res.redirect("/"+listName);
    });

  }
});
app.post("/delete", function(req, res) {
  const checkeditemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
  Item.findByIdAndRemove(checkeditemId, function(err) {
    if (!err) {
      console.log("Successfully deleted");
      res.redirect("/");
    }
  });
}
else{
  List.findOneAndUpdate({name:listName},{$pull : {items:{_id:checkeditemId}}},function(err,result){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000");
});
