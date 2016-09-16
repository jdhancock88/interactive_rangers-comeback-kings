$(document).ready(function() {

	//custom scripting goes here

	// injecting current year into footer
	// DO NOT DELETE

	var d = new Date();
	var year = d.getFullYear();

	$('.copyright').text(year);


	$.getJSON("/assets/python-scripts/json/rangers-game-logs.json", function(data) {
		drawGameLogs(data, "#tex-game-log-chart");
	});

	$.getJSON("/assets/python-scripts/json/team-skeds/LAA-game-logs.json", function(data) {
		drawGameLogs(data, "#opp-game-log-chart");
	});

	function drawGameLogs(data, target) {
		d3.select(target).html("");

		console.log(data);
		var gameLogs = d3.select(target).selectAll(".game-log")
			.data(data);

			gameLogs.enter().append("span")
				.attr("class", function(d) {
					if (d.one_run_win === true) {
						return ("game-log one-run-win");
					} else if (d.one_run_loss === true) {
						return ("game-log one-run-loss");
					} else {
						return ("game-log");
					}
				});
	}


	$("#opponents-selector select").change(function() {
		var selectedTeam = $(this).children("option:selected").attr("data-team");
		console.log(selectedTeam);

		var mascot = $(this).children("option:selected").text();

		$("#opp-game-logs h5").text(mascot);

		$.getJSON("/assets/python-scripts/json/team-skeds/"+selectedTeam+"-game-logs.json", function(data) {
			drawGameLogs(data, "#opp-game-log-chart");
		});

	});


});
