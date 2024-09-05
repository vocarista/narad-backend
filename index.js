const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');


app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});