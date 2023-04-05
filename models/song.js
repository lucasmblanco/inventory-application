const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 

const SongSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist"
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: "Album"
    },
    track_number: {
        type: Number,
    }, 
    duration: {
        type: Number,
        required: true
    },
    genre: [{
        type: Schema.Types.ObjectId,
        ref: "Genre"
    }],

}); 

SongSchema.virtual("url").get(function () {
    return `/songs/detail/${this._id}`
})


module.exports = mongoose.models.Song || mongoose.model("Song", SongSchema); 