const express = require('express') // server express
const dotenv = require('dotenv') //config 
const morgan = require('morgan')

const connectDB = require('./config/db')
const exphbs = require('express-handlebars') //expresshandlebars
const path = require('path')
const passport = require('passport')
const session = require('express-session')
//Load config file
dotenv.config({ path: './config/config.env' }) //variabilele globale  
//Passport config 
require('./config/passport')(passport)
connectDB()//conectare la baza de date
const app = express() //initializare app
//Loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')) //afiseaza raspunsurile de la server in consola 
}
//Handlebars

app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
  })
)
app.set('view engine', '.hbs')



//Session

app.use(session({
  secret: 'keyboard cat',
  resave: false, //nu salvam sesiunile daca nu se modifica ceva 
  saveUninitialized: false, //nu se creaza o sesiune pana cand nu salvam ceva 
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))



// Static folder
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000     //process.env ne da acces la variabilele din config.env
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} `))

