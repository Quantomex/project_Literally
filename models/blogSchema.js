const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    name: String,
    description: String,
    date: String,
    url: String,
    from: String,
    imageFilename: String, 
    imagePath: String, 
});

module.exports = mongoose.model('Blog', blogSchema);
