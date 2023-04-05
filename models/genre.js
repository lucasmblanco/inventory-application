const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 

const GenreSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}); 


GenreSchema.virtual("url").get(function () {
    return `/genres/detail/${this._id}`
})


module.exports = mongoose.models.Genre || mongoose.model("Genre", GenreSchema); 