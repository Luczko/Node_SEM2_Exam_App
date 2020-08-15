require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const Advert = require("./advert.model");
const User = require("./user.model");

const express = require("express");
const { where } = require("./advert.model");
const app = express();

app.use(express.json());

// middleware do autoryzacji oraz przekazanie użytkownika dalej
// wysyłany header: Authorization: basic admin:alamakota123
// jeżeli w nagłówkach został podany login i hasło pobierzmy dane użytkownika i dodajmy do zmiennej 'req' użytkownika z bazy
app.use(async (req, res, next) => {
  const authorization = (req.headers.authorization || "").split(" ")[1];
  if (authorization) {
    const [username, password] = authorization.split(":");
    req.user = await User.findOne({ username, password });
  }
  next();
});

//  pobieranie wszystkich ogłoszeń z bazy danych
//  http://localhost:4000/adverts/
//  GET
app.get("/adverts", async (req, res) => {
  const adverts = await Advert.find(req.query).populate("user");
  res.send(adverts);
});

//  pobieranie ogłoszenia po id
//  http://localhost:4000/adverts/:id
//  GET
app.get("/adverts/:id", async (req, res) => {
  const { id } = req.params;
  const advert = await Advert.findById(id).populate("user");
  res.send(advert);
});

//  pobieranie ogłoszenia po nazwie
//  http://localhost:4000/adverts/name/:name
//  GET
app.get("/adverts/name/:name", async (req, res) => {
  const { name } = req.params;
  const advert = await Advert.find({ advert: new RegExp(name, "i") }).populate(
    "user"
  );
  res.send(advert);
});

//  pobieranie ogłoszenia po dacie
//  http://localhost:4000/adverts/date/:date    format: 2020-06-30
//  GET
app.get("/adverts/date/:date", async (req, res) => {
  const { date } = req.params;
  const advert = await Advert.find({ date: new RegExp(date, "i") }).populate(
    "user"
  );
  res.send(advert);
});

//  pobieranie ogłoszenia po mieście
//  http://localhost:4000/adverts/place/:place
//  GET
app.get("/adverts/place/:place", async (req, res) => {
  const { place } = req.params;
  const advert = await Advert.find({ place: place }).populate("user");
  res.send(advert);
});

//  pobieranie ogłoszenia po kategorii
//  http://localhost:4000/adverts/category/:category
//  GET
app.get("/adverts/category/:category", async (req, res) => {
  const { category } = req.params;
  const advert = await Advert.find({ category: category }).populate("user");
  res.send(advert);
});

//  pobieranie ogłoszenia po cenie
//  http://localhost:4000/adverts/price/:low/:high
//  GET
app.get("/adverts/price/:low/:high", async (req, res) => {
  const { low, high } = req.params;
  const advert = await Advert.where("price")
    .gte(low)
    .lte(high)
    .populate("user");
  res.send(advert);
});

// //  pobieranie ogłoszenia po userze
// //  http://localhost:4000/adverts/user/:firstname/:lastname
// //  GET
app.get("/adverts/user/:name", async (req, res) => {
  const { name } = req.params;
  const user = await User.find({
    username: name,
  });
  const advert = await Advert.find({
    user: user,
  }).populate("user");
  res.send(advert);
});

//  dodawanie nowego zadania
//  nagłówek 'authorization' o wartości: 'basic admin:alamakota123'
//  http://localhost:4000/adverts/
//  POST
//  {
//         "advert": "test2",
//         "price": "50",
//         "place": "Bialystok"
//     }
app.post("/adverts", async (req, res) => {
  const advert = new Advert(req.body);
  advert.user = req.user;
  await advert.save();
  res.status(201).send(advert);
});

// dodawanie nowego użytkownika do bazy
// http://localhost:4000/users
// POST

// {
//     "username": "admin",
//     "password": "alamakota123",
//     "firstName": "Jan",
//     "lastName": "Kowalski"
// }
app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).send();
});

// middleware do modyfikowania (usuwanie, zmienianie)
// nagłówek 'authorization' o wartości: 'modify'
const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization === "modify") {
    next();
  } else {
    res.sendStatus(401);
  }
};
app.use(authMiddleware);

// aktualizacja ogłoszenia
// http://localhost:4000/adverts/id
// PUT
//     {
//         "place": Warszawa
//     }
app.put("/adverts/:id", async (req, res) => {
  const { id } = req.params;
  const advert = await Advert.findByIdAndUpdate(id, req.body).populate("user");
  res.send(advert);
});

// kasowanie ogłoszenia
// http://localhost:4000/adverts/id
// DELETE
app.delete("/adverts/:id", async (req, res) => {
  const { id } = req.params;
  await Advert.findByIdAndDelete(id);
  res.status(200).send();
});

app.listen(4000, () => console.log("server started!"));
