//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//declare mongoose
const mongoose = require("mongoose");
const _ = require("lodash");

// const date = require(__dirname + "/date.js");

//for mongoose not required
// const items = ["BreakFast", "Workout", "classes"];
// const workItems = [];

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
//mongodb://127.0.0.1/todolistDB
mongoose.connect("mongodb+srv://Pritam9437:Mongo9437@cluster0.72niems.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "BreakFast",
});
const item2 = new Item({
  name: "Workout",
});
const item3 = new Item({
  name: "Classes",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  //date

  // currentday = today.getDay();

  //type-2
  // var day = "";
  // switch (currentday) {
  //   case 0:
  //     day = "Sunday";
  //     break;
  //   case 1:
  //     day = "Monday";
  //     break;
  //   case 2:
  //     day = "Tuesday";
  //     break;
  //   case 3:
  //     day = "Wednesday";
  //     break;
  //   case 4:
  //     day = "Thursday";
  //     break;
  //   case 5:
  //     day = "Friday";
  //     break;
  //   case 6:
  //     day = "Saturday";
  //     break;

  //   default:
  //       console.log("Error: current day is equal to: " + currentday);
  //     break;
  // }

  //type-1
  //   if (currentday == 6 || currentday == 0) {
  //     day = "weekend";
  //   } else {
  //     day = "weekday";
  //   }

  //type-03
  //  const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved the dafault items to the DB!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

  // res.render("list", { listTitle: "Today", newListItems: items });
});

app.get("/:customListName", function (req, res) {
  // console.log(req.params.customListName);

  //use lodash
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // console.log("Doesn't exists!")
        //Create a new list

        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("Exists!")
        //show an existing list

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newitem;
  const listName = req.body.list;

  //for mongoose
  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // console.log(req.body);
  // if (req.body.list === "work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  // console.log(req.body.checkbox);

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully deleted chekced item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "work list", newListItems: workItems });
// });

app.post("/work", function (req, res) {
  const item = req.body.newitem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
