const PORT = 3141;
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.static('dist'));
app.listen(PORT);
