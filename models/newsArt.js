const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const exMoustache = require("express-handlebars");
//const axios = require ("axios");

const Articleschema = new Schema({
	title: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	summary: {
		type: String,
		default: "This is embarrassing....there's no summary."
	},
	img: {
		type: String,
	},
	issaved: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		default: "Save Article"
	},
	created: {
		type: Date,
		default: Date.now
	},
	note: {
		type: Schema.Types.ObjectId,
		ref: "Note"
	}
});

Articleschema.index({title: "text"});

const Article  = mongoose.model("Article", Articleschema);
module.exports = Article;