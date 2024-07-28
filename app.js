// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
require("./config/sessions.config")(app)

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "scribbles";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const scribbleRoutes = require("./routes/scribbles.routes");
app.use("/", scribbleRoutes);

const userRoutes = require("./routes/auth.routes");
app.use("/", userRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

// Register Handlebars helpers
hbs.registerHelper('ifEqual', function(v1, v2, options) {
    if (v1.toString() === v2.toString()) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

module.exports = app;
