require("./helpers/utils");
const app = require("express")();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/db");
require("./sequelizeAssociations");
const routes = require("./routes");
const authRoute = require("./routes/auth");
const logger = require("morgan");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const docs = require("./docs");
const config = require("./config");
const { colorLog } = require("./helpers/utils");
const { failedResponse } = require("./helpers/responsePattern");
const http = require("http");
const path = require("path");
var cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  logger(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
// app.set('view engine', 'jade');
app.set("view engine", "ejs");

app.use(async (req, res, next) => {
  const _end = res.end;
  const transaction = await sequelize.transaction();

  req.tx = transaction;
  let chunks = [];
  res.end = async function (chunk) {
    let showBodyError = true;
    if (chunk) chunks.push(chunk);
    let response = Buffer.concat(chunks).toString("utf8");
    try {
      if (typeof response === "string") response = JSON.parse(response);
    } catch (error) {
      showBodyError = false;
    }
    if (showBodyError && response.success == undefined)
      console.log(colorLog("UNABLE TO GET BODY ON res.end", 31, 47, 7));
    try {
      console.log(response);
      if (response.success) await req.tx.commit();
      else await req.tx.rollback();
    } catch (error) {
      console.log(error);
    }
    _end.apply(res, arguments);
  };

  next();
});

app.use("/api", routes);
app.use("/auth", authRoute);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(docs));

app.use(function (req, res, next) {
  next({ status: 404, message: "Api not found" });
});

app.use(function (err, req, res, next) {
  console.log(err);
  if (err?.name === "ValidationError")
    err = new failedResponse(err.message, err.details);
  res.status(err.status || 500).json(err);
});

const server = http.createServer(app);
server.listen(config.port || 3015, () => {
  console.log(`Server started at ${colorLog(config.port, 36, 0, 7)}.`);
  sequelize
    .sync()
    .then((data) => {
      console.log("Data==>", data.config);
      console.log(
        `connected with database ${colorLog(data.config.database, 36, 0, 7)}.`
      );
    })
    .catch((err) => {
      console.log("ERROR =============================> ", err);
    });
});
