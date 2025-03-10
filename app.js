var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var partnershipRouter = require("./routes/partnershipRoutes")

const session = require('express-session');
const flash = require('connect-flash');
const studiesDocumentRoutes = require("./routes/studiesDocumentRoutes")
const genericRegisterRoutes = require("./routes/genericRegisterRoutes")
const meetingsEventsRoutes = require("./routes/meetingsEventsRoutes")
const pafoSeatsRoutes = require("./routes/pafoSeatsRoutes")
const trainings = require("./routes/trainingsRoutes")
const financeRoutes = require("./routes/Finances")
const FinancesBudgetRoutes = require("./routes/FinancesBudget")

require('./models/Partnerships');
require('./models/Partners');
require('./models/Responsibilities');
require('./models/m_eGenericRegisterPartcipants');
require('./models/PartnershipBudget');
require('./models/PartnershipActivities');
require("./models/m_eStudiesDocument");
require("./models/m_eMeetingsEvents")
require("./models/m_ePafoSeats")
const BudgetPlanning =  require("./models/f_BudgetPlanning")


const Project = require("./models/Project")
const fComponent = require("./models/f_Component")
const fActivity = require("./models/f_activity")
// const partnershipRoutes = require('./routes/partnershipRoutes');

var app = express();
const sequelize = require('./config/database');

// Define relationships here

fComponent.belongsTo(Project, { foreignKey: "project_id" });
Project.hasMany(fComponent, { foreignKey: "project_id" });
fActivity.belongsTo(fComponent, { foreignKey: "component_id" });
fComponent.hasMany(fActivity, { foreignKey: "component_id" });
fActivity.belongsTo(fActivity, { as: "ParentActivity", foreignKey: "parent_id" });
fActivity.hasMany(fActivity, { as: "Subactivities", foreignKey: "parent_id" });

// fActivity.hasMany(fActivity, { as: "Subactivities", foreignKey: "parent_id" });
fActivity.hasMany(fActivity, { as: "SubSubactivities", foreignKey: "parent_id" });
fActivity.hasMany(fActivity, { as: "SSubactivities", foreignKey: "parent_id" });
BudgetPlanning.belongsTo(fComponent, { foreignKey: 'component_id' });
fComponent.hasMany(BudgetPlanning, { foreignKey: 'component_id' });

BudgetPlanning.belongsTo(fActivity, { foreignKey: 'activity_id' });
fActivity.hasMany(BudgetPlanning, { foreignKey: 'activity_id' });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);
app.use('/partnership', partnershipRouter);
app.use("/m_estudies",studiesDocumentRoutes)
app.use("/m_egeneric",genericRegisterRoutes)
app.use("/m_emeetings",meetingsEventsRoutes)
app.use("/m_epafo-seats",pafoSeatsRoutes)
app.use("/m_etrainings",trainings)
app.use("/finance",financeRoutes)
app.use("/finance-budget",FinancesBudgetRoutes)

sequelize.sync({ force: false }).then(async () => {
  try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: false });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('Database synced');
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
      console.error('Unable to sync database:', err);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 5000);
  res.render('error');
});



module.exports = app;
