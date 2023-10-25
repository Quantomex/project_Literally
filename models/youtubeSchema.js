const mongoose = require('mongoose');

const youtubeSchema = new mongoose.Schema({
    name: String,
    description: String,
    detail: String,
    url: String,
    heart: String,
    view: String,
    imageFilename: String, 
    imagePath: String, 

});

module.exports = mongoose.model('Youtube', youtubeSchema);