const express = require("express");
const method = require("method-override");
const body = require("body-parser");
const exMoustache = require("express-handlebars");
const mongoose = require("mongoose");
const cheerio = require("cheerio");

const Note = require("./models/Note");
const Article = require("./models/Article");
const databaseUrl = 'mongodb://localhost/scrap';

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(databaseUrl);
};

mongoose.Promise = Promise;
let db = mongoose.connection;

db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

db.once("open", function() {
	console.log("Mongoose connection successful.");
});


let app = express();
let port = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.static("public"));
app.use(body.urlencoded({extended: false}));
app.use(method("_method"));
app.engine("handlebars", exMoustache({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.listen(port, function() {
	console.log("Listening on port " + port);
})

// Route route route route route route

app.get("/", function(req, res) {
	Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("pholder", {message: "You haven't grabbed anything just yet. Please click \"Scratch The Internets Surface For Newest Articles\" for tasty, awesome, maybe even aggravating, news."});
		}
		else{
			res.render("index", {articles: data});
		}
	});
});

app.get("/scrape", function(req, res) {
	function("https://www.nytimes.com/section/us", function(error, response, html) {
		let $ = cheerio.load(html);
		let result = {};
		$("div.story-body").each(function(i, element) {
			let link = $(element).find("a").attr("href");
			let title = $(element).find("h2.headline").text().trim();
			let summary = $(element).find("p.summary").text().trim();
			let img = $(element).parent().find("figure.media").find("img").attr("src");
			result.link = link;
			result.title = title;
			if (summary) {
				result.summary = summary;
			};
			if (img) {
				result.img = img;
			}
			else {
				result.img = $(element).find(".wide-thumb").find("img").attr("src");
			};
			const entry = new Article(result);
			Article.find({title: result.title}, function(err, data) {
				if (data.length === 0) {
					entry.save(function(err, data) {
						if (err) throw err;
					});
				}
			});
		});
		console.log("Roadras-...I mean scraping complete.");
		res.redirect("/");
	});
});

app.get("/saved", function(req, res) {
	Article.find({issaved: true}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("pholder", {message: "You have to save something to check it out later. Save some news by simply clicking \"Save ME\"!"});
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});

app.get("/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		res.json(data);
	})
})

app.post("/search", function(req, res) {
	console.log(req.body.search);
	Article.find({$text: {$search: req.body.search, $caseSensitive: false}}, null, {sort: {created: -1}}, function(err, data) {
		console.log(data);
		if (data.length === 0) {
			res.render("pholder", {message: "Nothing has been found. Please try other keywords."});
		}
		else {
			res.render("search", {search: data})
		}
	})
});

//all of the truthy falsy =/

app.post("/save/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		if (data.issaved) {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: false, status: "Save ME"}}, {new: true}, function(err, data) {
				res.redirect("/");
			});
		}
		else {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: true, status: "Saved"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

app.post("/note/:id", function(req, res) {
	let note = new Note(req.body);
	note.save(function(err, doc) {
		if (err) throw err;
		Article.findByIdAndUpdate(req.params.id, {$set: {"note": doc._id}}, {new: true}, function(err, newdoc) {
			if (err) throw err;
			else {
				res.send(newdoc);
			}
		});
	});
});

app.get("/note/:id", function(req, res) {
	let id = req.params.id;
	Article.findById(id).populate("note").exec(function(err, data) {
		res.send(data.note);
	})
})