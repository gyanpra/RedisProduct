const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const redis = require("redis");

let client = redis.createClient();
client.on("connect", function () {
  console.log("connected to redis");
});

const port = 3000;

const app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));

app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(methodOverride("_method"));

app.get("/", function (req, res, next) {
  res.render("searchproducts");
});

app.post("/product/search", function (req, res, next) {
  let id = req.body.id;

  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render("searchproducts", {
        error: "Product not exist",
      });
    } else {
      obj.id = id;
      res.render("detail", {
        product: obj,
      });
    }
  });
});

app.get("/product/add", function (req, res, next) {
  res.render("addproduct");
});

// Process Add User Page
app.post("/product/add", function (req, res, next) {
  let id = req.body.id;
  let name = req.body.name;
  let price = req.body.price;
  let brand = req.body.brand;
  let rating = req.body.rating;

  client.hmset(
    id,
    ["name", name, "price", price, "brand", brand, "rating", rating],
    function (err, reply) {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

// Delete User
app.delete("/product/delete/:id", function (req, res, next) {
  client.del(req.params.id);
  res.redirect("/");
});

app.listen(port, function () {
  console.log("Server started at port " + port);
});
