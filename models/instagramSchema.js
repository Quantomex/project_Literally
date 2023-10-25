const mongoose = require('mongoose');
const instagramSchema = new mongoose.Schema({
    name: String,
    description: String,
    imageFilename: String, 
    imagePath: String, 
});
module.exports = mongoose.model('Insta', instagramSchema);
