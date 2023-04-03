const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 

const AlbumSchema = new Schema({
    title: {
        type: String,
        required: true, 
        maxLength: 100,
    }, 
    artist: {
        type: Schema.Types.ObjectId,
        ref: "Author", 
        required: true
    },
    cover: {
        type: Buffer,
    },
    release_year: {
        type: Number,
        required: true
    },
    genre: [{
        type: Schema.Types.ObjectId, 
        ref: "Genre",
    }],
})

module.exports = mongoose.models.Album || mongoose.model('Album', AlbumSchema); 