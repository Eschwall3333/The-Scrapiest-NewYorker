function shownote(event) {


    event.preventDefault();
    

	const id = $(this).attr("value");
	$("#addnote").fadeIn(300).css("display", "flex");
	$("#add-note").attr("value", id);
	$.get("/" + id, function(data) {


		$("#article-title").text(data.title);
		$.get("/note/" + id, function(data) {


			if (data) {
				$("#note-title").val(data.title);
				$("#note-body").val(data.body);
			}
		});
	});

}

function addnote(event) {


	event.preventDefault();
	const id = $(this).attr("value");
	const obj = {


		title: $("#note-title").val().trim(),
		body: $("#note-body").val().trim()
	};
	$.post("/note/" + id, obj, function(data) {
		window.location.href = "/saved";
	});
}

function changestatus() {


	const status = $(this).attr("value");
	if (status === "Saved") {
		$(this).html("get rid of it");
	}
};

function changeback() {


	$(this).html($(this).attr("value"));
}

$(document).on("click", ".addnote-button", shownote);

$(document).on("click", "#add-note", addnote);
$(".status").hover(changestatus, changeback);
$("#close-note").on("click", function() {
	$("#addnote").fadeOut(300);
});