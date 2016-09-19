$(document).ready(function() {

	//custom scripting goes here

	// injecting current year into footer
	// DO NOT DELETE

	var d = new Date();
	var year = d.getFullYear();

	$('.copyright').text(year);


	var standings = [
		{
			"team": "Rangers",
			"wins": 88,
			"losses": 62
		},
		{
			"team": "Mariners",
			"wins": 79,
			"losses": 70
		},
		{
			"team": "Astros",
			"wins": 78,
			"losses": 71
		},
		{
			"team": "Athletics",
			"wins": 66,
			"losses": 83
		},
		{
			"team": "Angels",
			"wins": 65,
			"losses": 84
		}
	];


	$.getJSON("/assets/python-scripts/json/rangers-game-logs.json", function(data) {

		var texWL = {
			"wins": 0,
			"losses": 0
		};

		$.each(data, function(k, v) {
			if (v.one_run_win === true) {
				texWL.wins ++;
			} else if (v.one_run_loss === true) {
				texWL.losses ++;
			}
		});

		drawGameLogs(data, "#tex-game-log-chart");
		drawWinsLosses(texWL, "#tex-wins-losses");

		simFormat(data);

	});

	$.getJSON("/assets/python-scripts/json/team-skeds/LAA-game-logs.json", function(data) {

		var oppWL = {
			"wins": 0,
			"losses": 0
		};

		$.each(data, function(k, v) {
			if (v.one_run_win === true) {
				oppWL.wins ++;
			} else if (v.one_run_loss === true) {
				oppWL.losses ++;
			}
		});


		drawGameLogs(data, "#opp-game-log-chart");
		drawWinsLosses(oppWL, "#opp-wins-losses");

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

	function drawWinsLosses(data, target) {

		$(target).empty();

		for (i=0; i<data.wins; i++) {
			$(target).append("<span class='game-log one-run-win'></span>");
		}

		for (i=0; i<data.losses; i++) {
			$(target).append("<span class='game-log one-run-loss'></span>");
		}

	}










	function simFormat(data) {

		var oneRunners = [];
		var adjustedStandings = standings;

		var opponent, teamIndex;

		$.each(data, function(k,v) {
			if (v.one_run_win === true) {
				oneRunners.push(v);
				adjustedStandings[0].wins--;

				opponent = v.opponent;

				teamIndex = _.findIndex(adjustedStandings, function(o) {return o.team == opponent;});

				if (teamIndex !== -1) {
					adjustedStandings[teamIndex].losses--;
				}

			}

			if (v.one_run_loss === true) {
				oneRunners.push(v);
				adjustedStandings[0].losses--;

				opponent = v.opponent;

				teamIndex = _.findIndex(adjustedStandings, function(o) {return o.team == opponent;});

				if (teamIndex !== -1) {
					adjustedStandings[teamIndex].wins--;
				}
			}
		});



		runSim(oneRunners, adjustedStandings, 50);
	}
















	function runSim(data, standings, rate) {

		console.log(standings);
		rate = rate / 100;

		console.log(rate);
		var opponent, teamIndex;

		$.each(data, function(k,v) {

			var currentOutcome;

			var n = Math.random();
			if (n <= rate) {
				standings[0].wins++;

				opponent = v.opponent;
				teamIndex = _.findIndex(standings, function(o) {return o.team == opponent;});

				if (teamIndex !== -1) {
					adjustedStandings[teamIndex].losses++;
				}

			} else {
				standings[0].losses++;

				opponent = v.opponent;
				teamIndex = _.findIndex(standings, function(o) {return o.team == opponent;});

				if (teamIndex !== -1) {
					adjustedStandings[teamIndex].wins++;
				}
			}

		});

		console.log(standings);
	}


	$("#opponents-selector select").change(function() {
		var selectedTeam = $(this).children("option:selected").attr("data-team");
		console.log(selectedTeam);

		var mascot = $(this).children("option:selected").text();

		$("#opp-game-logs h5").text(mascot);

		$.getJSON("/assets/python-scripts/json/team-skeds/"+selectedTeam+"-game-logs.json", function(data) {

			var oppWL = {
				"wins": 0,
				"losses": 0
			};

			$.each(data, function(k, v) {
				if (v.one_run_win === true) {
					oppWL.wins ++;
				} else if (v.one_run_loss === true) {
					oppWL.losses ++;
				}
			});
			drawGameLogs(data, "#opp-game-log-chart");
			drawWinsLosses(oppWL, "#opp-wins-losses");

		});

	});


});
