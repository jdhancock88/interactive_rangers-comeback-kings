$(document).ready(function() {

	//custom scripting goes here

	// injecting current year into footer
	// DO NOT DELETE

	var simData;

	var d = new Date();
	var year = d.getFullYear();

	$('.copyright').text(year);

	var sliderValue = 50;

	////////////////////////////////////////////////////////////////////////////
	///// INITIAL DATA DRAW AND FORMATTING /////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

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

		simData = data;

		drawGameLogs(data, "#tex-game-log-chart");
		drawWinsLosses(texWL, "#tex-wins-losses");


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


	////////////////////////////////////////////////////////////////////////////
	///// DRAWING THE GAME LOGS ////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

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

	////////////////////////////////////////////////////////////////////////////
	///// DRAWING THE ONE-RUNS WINS AND LOSSES /////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function drawWinsLosses(data, target) {

		$(target).empty();

		for (i=0; i<data.wins; i++) {
			$(target).append("<span class='game-log one-run-win'></span>");
		}

		for (i=0; i<data.losses; i++) {
			$(target).append("<span class='game-log one-run-loss'></span>");
		}

	}



	////////////////////////////////////////////////////////////////////////////
	///// RUNNING THE SIMULATION ///////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	// ****** CLICKING THE SIM BUTTON ******

	$("#sim-button").click(function() {
		console.log("test");

		// resets standings to actual finish
		var standings = [
			{"team": "rangers","abbr": "TEX","wins": 88,"losses": 62},
			{"team": "mariners","abbr": "SEA","wins": 79,"losses": 70},
			{"team": "astros","abbr": "HOU","wins": 78,"losses": 71},
			{"team": "athletics","abbr": "OAK","wins": 66,"losses": 83},
			{"team": "angels","abbr": "LAA","wins": 65,"losses": 84}
		];

		$("#sim-button").hide();
		// hands off the standigs, gamelogs, and threshold to the simulation
		runSim(standings, simData, sliderValue);
	});


	// ****** FORMATTING THE DATA ******

	function runSim(standings, simData, rate) {

		$("#sim-chart .chart-body").html("");

		// clear our oneRunners, opponent and teamIndex variables
		var oneRunners = [];
		var opponent, teamIndex;


		// iterate over the original gamelogs to find if the rangers won/loss a one-run
		// game. if so, update the standings by removing the win/loss from the rangers
		// record. if it was a divisional opponent, also remove their win/loss
		// we also populate the oneRunners array with those games, which we'll use to run the sim

		$.each(simData, function(k,v) {
			if (v.one_run_win === true) {
				oneRunners.push(v);

				//update the rangers win total
				standings[0].wins--; //updating the rangers win total

				// find the opponent
				opponent = v.opponent;

				// checking if the opponent is in the division. if so, update their loss total
				teamIndex = _.findIndex(standings, function(o) {return o.team == opponent;});
				if (teamIndex !== -1) {
					standings[teamIndex].losses--;
				}
			}

			if (v.one_run_loss === true) {
				oneRunners.push(v);

				//update the rangers loss total
				standings[0].losses--;

				// find opponent
				opponent = v.opponent;

				// check if the opponent is a divisional oppennt, and if so, update their win total
				teamIndex = _.findIndex(standings, function(o) {return o.team == opponent;});
				if (teamIndex !== -1) {
					standings[teamIndex].wins--;
				}
			}
		});


		// ****** RUNNING THE SIMULATION ******

		// reset the rate to be a decimal
		rate = rate / 100;

		// clearing our opponent and teamIndex variables for reuse in the simulation
		opponent = "";
		teamIndex = 0;

		var winsLosses = [];

		// go through the games in oneRunners and decide a fictional outcome based on the win rate supplied
		$.each(oneRunners, function(k,v) {

			var currentOutcome;

			// grab a random number, and see if it's less than (a win) or greater than (a loss)
			// our supplied win rate
			var n = Math.random();

			// if the random number is less than our win rate, that counts as a win
			// so, we update the rangers win total, check if the opponent is a divisional
			// opponent, and if so, update their loss total in the standings
			if (n <= rate) {
				winsLosses.push("win");
				standings[0].wins++;
				opponent = v.opponent;
				teamIndex = _.findIndex(standings, function(o) {return o.abbr == opponent;});
				if (teamIndex !== -1) {
					standings[teamIndex].losses++;
				}

				// $("#simChart").append("<span class='game-log one-run-win'></span>");

			// else, if the random number is greater than the win rate, it counts
			// as a loss, so we update the rangers loss total in the standings, check
			// if the opponent is a divisonal opponent, and if so, update their win total
			} else {
				winsLosses.push("loss");
				standings[0].losses++;
				opponent = v.opponent;
				teamIndex = _.findIndex(standings, function(o) {return o.abbr == opponent;});
				if (teamIndex !== -1) {
					standings[teamIndex].wins++;
				}

				// $("#simChart").append("<span class='game-log one-run-loss'></span>");
			}

		});

		for (i=0; i<winsLosses.length; i++) {

			setTimeout(function(x) {
				return function() {
					if (winsLosses[x] === "win") {
						$("#sim-chart .chart-body").append("<span class='game-log one-run-win'></span>");
					} else {
						$("#sim-chart .chart-body").append("<span class='game-log one-run-loss'></span>");
					}

					if (x === winsLosses.length - 1) {
						// now that our standings have been simulated, we want to redorder the
						// array by team wins
						standings = _.orderBy(standings, "wins", "desc");

						// set a variable equal to the number of wins of the highest team
						var leadWins = standings[0].wins;

						// go through the standings again, figuring out how how many games behind
						// each team is from the first-place team, and each team's win percentage
						// then update the html standings table with the new wins, losses, win perct.,
						// and games behind totals
						$.each(standings, function(k,v) {
							var gamesBack = leadWins - v.wins;
							console.log(k);
							v.games_behind = gamesBack;
							v.pct = (v.wins / (v.wins + v.losses)).toFixed(3).slice(1,5);

							$("#" + v.team + "-row").children("td").eq(1).text(v.wins);
							$("#" + v.team + "-row").children("td").eq(2).text(v.losses);
							$("#" + v.team + "-row").children("td").eq(3).text(v.pct);
							$("#" + v.team + "-row").children("td").eq(4).text(v.games_behind);

							// each table row is absolutely positioned within the table so we can
							// animate the change in position after the simulation runs. We know each
							// table row is 29px tall, so we just multiply that by the key of that particular
							// team in the standings array.
							$("#" + v.team + "-row").css("top", "calc(29px * " + (k + 1) + ")");

						});

						$("#sim-button").text("Re-run simulation").show();
					}
				};
			}(i), 200*i);
		}
	}


	////////////////////////////////////////////////////////////////////////////
	///// CHANGING THE OPPONENT FOR THE GAME LOG CHART /////////////////////////
	////////////////////////////////////////////////////////////////////////////

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


	$("#slider").slider({
		animate: "fast",
		max: 100,
		value: 50,
		change: function() {
			sliderValue = $("#slider").slider("value");
			$("#slider-value").text(sliderValue + "%").css("left", sliderValue + "%");
		}
	});


});
