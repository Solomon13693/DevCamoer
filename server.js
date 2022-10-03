const app = require('./app')
const connectDB = require('./database/db')

// DATABASE CONNECTIONS 
connectDB()


const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Bootcamp app listening on port ${PORT}!`))