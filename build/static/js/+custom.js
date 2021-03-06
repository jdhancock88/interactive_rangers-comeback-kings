$(document).ready(function() {

	//custom scripting goes here

	// injecting current year into footer
	// DO NOT DELETE

	var simData;

	var d = new Date();
	var year = d.getFullYear();

	$('.copyright').text(year);

	var sliderValue = 77;

	var ninthData;


	// clicking anywher in the document outside the dropdown will close the dropdown
	// for the game logs and late and close charts

	$(document).click(function() {
		$(".custom-list").addClass("no-show");
	});



	////////////////////////////////////////////////////////////////////////////
	///// INITIAL DATA DRAW AND FORMATTING /////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	$.getJSON("assets/python-scripts/json/rangers-game-logs.json", function(data) {

		// setting up a wins/loss object for Texas
		var texWL = {
			"wins": 0,
			"losses": 0
		};

		// populating that win loss object
		$.each(data, function(k, v) {
			if (v.one_run_win === true) {
				texWL.wins ++;
			} else if (v.one_run_loss === true) {
				texWL.losses ++;
			}
		});

		// handing toff the data to simData
		simData = data;

		// hand off the data to the function that draws the game logs and the
		// logs of just the wins and losses
		drawGameLogs(data, "#tex-game-log-chart");
		drawWinsLosses(texWL, "#tex-wins-losses");


	});


	$.getJSON("assets/python-scripts/json/team-skeds/LAA-game-logs.json", function(data) {

		// setting up a wins/loss object for the other teams
		var oppWL = {
			"wins": 0,
			"losses": 0
		};

		// populating that win loss object
		$.each(data, function(k, v) {
			if (v.one_run_win === true) {
				oppWL.wins ++;
			} else if (v.one_run_loss === true) {
				oppWL.losses ++;
			}
		});

		// populating the record in wins and losses in one run games of the opponent chosen
		$("#opp-total").text(oppWL.wins + "-" + oppWL.losses);

		// hand off the data to the function that draws the game logs and the
		// logs of just the wins and losses
		drawGameLogs(data, "#opp-game-log-chart");
		drawWinsLosses(oppWL, "#opp-wins-losses");

	});


	$.getJSON("assets/python-scripts/json/ninthInning.json", function(data) {

		ninthData = data;

		// drawing the logs of ninth-inning comeback wins for texas and the opponent chosen
		drawNinthWins("LAA", "#opp-ninth-wins");
		drawNinthWins("TEX", "#tex-ninth-wins");
	});


	////////////////////////////////////////////////////////////////////////////
	///// DRAWING THE GAME LOGS ////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function drawGameLogs(data, target) {

		// empty out the target html element where the chart will be drawn
		d3.select(target).html("");

		// bind the data to to the target to the game-log class in the target using d3
		var gameLogs = d3.select(target).selectAll(".game-log")
			.data(data);

			// draw out a span with the class game-log for each game in the team's
			// game log, adding a one-run-win or one-run-loss class if applicable
			gameLogs.enter().append("span")
				.attr("class", function(d) {
					if (d.one_run_win === true) {
						return ("game-log one-run-win");
					} else if (d.one_run_loss === true) {
						return ("game-log one-run-loss");
					} else {
						return ("game-log");
					}
				})
				.text(function(d) {
					if (d.one_run_win === true || d.one_run_loss === true) {
						return (d.win_loss);
					}
				});

		// call the tooltip function
		createToolTip(data, target);
	}

	////////////////////////////////////////////////////////////////////////////
	///// POPULATING AND DISPLAYING THE TOOLTIP ////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function createToolTip(data, target) {

		// add an event listener that listens for mouse enter to each game-log span
		$(target + " .game-log").on("mouseenter", function() {

			// grab the index number of that span
			var index = $(this).index();

			// find it's top and left offsets to the window, and the width of the window
			var top = $(this).offset().top;
			var left = $(this).offset().left;
			var winWidth = $(window).width();

			// use those offsets to set the position of the tooltip. based on if the
			// left position is greater than half the window width, we'll position the
			// tooltip to the left or the right of the target span
			$("#tool-tip").css("top", $(this).offset().top - 10);

			if (left > winWidth / 2) {
				$("#tool-tip").css({
					"left": left - ($("#tool-tip").outerWidth() + 10)
				});
			} else {
				$("#tool-tip").css({
					"right": "auto",
					"left": left + 25
				});
			}

			// populate the tooltip with the appropriate game data
			$("#game-date").text(data[index].game_date);
			$("#game-score").text(data[index].team + " " + data[index].runs + ", " + data[index].opponent + " " + data[index].runs_against);

			// display the tooltip
			$("#tool-tip").removeClass("no-show");
		});

		// then the game-log span is moused out, hide the tooltip again
		$(target + " .game-log").on("mouseout", function() {
			$("#tool-tip").addClass("no-show");
		});
	}



	////////////////////////////////////////////////////////////////////////////
	///// DRAWING THE ONE-RUNS WINS AND LOSSES /////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	// this is pretty simple. we take the win/loss object we created in the above
	// json calls, and simply draw a win or loss span for each one

	function drawWinsLosses(data, target) {

		$(target).empty();

		for (i=0; i<data.wins; i++) {
			$(target).append("<span class='game-log one-run-win'>W</span>");
		}

		for (i=0; i<data.losses; i++) {
			$(target).append("<span class='game-log one-run-loss'>L</span>");
		}

	}



	////////////////////////////////////////////////////////////////////////////
	///// DRAWING THE NINTH INNING COMEBACKS /////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function drawNinthWins(team, target) {

		// empty out the html from the target element
		$(target).empty();

		// we'll use this wins variable to draw out the appropriate number of
		// spans for each team's ninth-inning comeback wins

		var wins = 0;

		// iterate over the ninth-inning comeback data and find the supplied team
		// setting the wins variable equal to that team's number of wins
		$.each(ninthData, function(k,v) {
			if (v.id === team) {
				wins = ninthData[k].behindWins;
			}
		});

		// draw the spans for the graphic
		for (i=0; i<wins; i++) {
			$(target).append("<span class='game-log one-run-win'>W</span>");
		}
	}





	////////////////////////////////////////////////////////////////////////////
	///// RUNNING THE SIMULATION ///////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	// ****** CLICKING THE SIM BUTTON ******

	$("#sim-button").click(function() {

		// resets standings to actual finish
		var standings = [
			{"team": "rangers","abbr": "TEX","wins": 95,"losses": 67},
			{"team": "mariners","abbr": "SEA","wins": 86,"losses": 76},
			{"team": "astros","abbr": "HOU","wins": 84,"losses": 78},
			{"team": "angels","abbr": "LAA","wins": 74,"losses": 88},
			{"team": "athletics","abbr": "OAK","wins": 69,"losses": 93},
		];

		// hides the sim button while the simulation is running
		$("#sim-button").hide();

		// hands off the standigs, gamelogs, and threshold to the simulation
		runSim(standings, simData, sliderValue);
	});


	// ****** FORMATTING THE DATA ******

	function runSim(standings, simData, rate) {

		// empty the sim results div
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
				console.log(opponent);
				// checking if the opponent is in the division. if so, update their loss total
				teamIndex = _.findIndex(standings, function(o) {return o.abbr == opponent;});
				console.log(teamIndex);
				if (teamIndex !== -1) {
					console.log(standings[teamIndex]);
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
				teamIndex = _.findIndex(standings, function(o) {return o.abbr == opponent;});
				if (teamIndex !== -1) {
					console.log("opp win", standings[teamIndex]);
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
				standings[0].wins ++;
				opponent = v.opponent;
				teamIndex = _.findIndex(standings, function(o) {return o.abbr == opponent;});
				if (teamIndex !== -1) {
					standings[teamIndex].losses ++;
				}


			// else, if the random number is greater than the win rate, it counts
			// as a loss, so we update the rangers loss total in the standings, check
			// if the opponent is a divisonal opponent, and if so, update their win total
			} else {
				winsLosses.push("loss");
				standings[0].losses ++;
				opponent = v.opponent;
				teamIndex = _.findIndex(standings, function(o) {return o.abbr == opponent;});
				if (teamIndex !== -1) {
					standings[teamIndex].wins ++;
				}

			}

		});

		for (i=0; i<winsLosses.length; i++) {

			setTimeout(function(x) {
				return function() {

					// append the win and losses spans to the simulation
					if (winsLosses[x] === "win") {
						$("#sim-chart .chart-body").append("<span class='game-log one-run-win'>W</span>");
					} else {
						$("#sim-chart .chart-body").append("<span class='game-log one-run-loss'>L</span>");
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
							v.games_behind = gamesBack;
							v.pct = (v.wins / (v.wins + v.losses)).toFixed(3).slice(1,5);

							$("#" + v.team + "-row").children("td").eq(1).text(v.wins);
							$("#" + v.team + "-row").children("td").eq(2).text(v.losses);
							$("#" + v.team + "-row").children("td").eq(3).text(v.pct);
							$("#" + v.team + "-row").children("td").eq(4).text(v.games_behind);

							// each table row is absolutely positioned within the table so we can
							// animate the change in position after the simulation runs. We know each
							// table row is 29px tall, so we just multiply that by the key of that particular
							// team in the `standings` array.
							$("#" + v.team + "-row").css("top", "calc(29px * " + (k + 1) + ")");

						});

						// update the text of the simulation button and redisplay it after the sim finishes
						$("#sim-button").text("Re-run simulation").show();
					}
				};
			}(i), 100*i);
		}
	}


	////////////////////////////////////////////////////////////////////////////
	///// CHANGING THE OPPONENT FOR THE GAME LOG CHART /////////////////////////
	////////////////////////////////////////////////////////////////////////////

	$("#opponents-selector").click(function(event) {
		event.stopPropagation();
		$("#opponents-selector").siblings("ul").removeClass("no-show");

	});


	$("#opponents-selector").siblings("ul").children("li").on("click", function(event) {
		event.stopPropagation();

		// clicking on a team name in the dropdown selects the data-team attribute and the text
		selectedTeam = $(this).attr("data-team");
		mascot = $(this).text();

		// oncde a team is clicked on, the list collapses again
		$(this).parents("ul").addClass("no-show");

		// update the text of the opponent with the mascot name
		$("#opponents-selector .team").text(mascot + ": ");

		// get the game log of the team selected, create their win/loss object,
		// populate that object with data based on their bame log, then hand all that
		// off to the drawing functions we set up above
		$.getJSON("assets/python-scripts/json/team-skeds/"+selectedTeam+"-game-logs.json", function(data) {

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

			$("#opp-total").text(oppWL.wins + "-" + oppWL.losses);

			drawGameLogs(data, "#opp-game-log-chart");
			drawWinsLosses(oppWL, "#opp-wins-losses");

		});

		drawNinthWins(selectedTeam, "#opp-ninth-wins");
	});




	////////////////////////////////////////////////////////////////////////////
	///// SETTING UP THE SLIDER ELEMENT ////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	// we use the No Ui Slider plugin to build our slider
	// see the documentation here: https://refreshless.com/nouislider/

	var slider = document.getElementById("slider");

	noUiSlider.create(slider, {
		start: [77],
		range: {
			"min": [0],
			"max": [100]
		},
		format: wNumb({
			decimals: 0
		})
	});

	// when the slider changes, grab the new value, and change the position and text
	// of the label based on that value
	slider.noUiSlider.on("update", function(values, handle) {
		sliderValue = values[handle];
		$("#slider-value").text(sliderValue + "%").css("left", sliderValue + "%");
	});




	////////////////////////////////////////////////////////////////////////////
	///// DRAWING THE LATE AND CLOSE SCATTER PLOTS /////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	// formatters for our axis
	var hittingFormat = d3.format(".03f");
	var pitchingFormat = d3.format(".02f");

	// the actual draw functions takes in league and ranger data for hitting and pitching, along with averages for our data
	// sets to draw the data lines. Also, we supply the target divs where the charts will be drawn
	function drawLC(leagueHittingData, rangersHittingData, allHittingData, hittingAverages, hittingTarget, leaguePitchingData, rangersPitchingData, allPitchingData, pitchingAverages, pitchingTarget) {

		// margin setup
		var margin = {
		  top: 10,
		  right: 20,
		  bottom: 50,
		  left: 50
		};

		// our target divs for our charts are the same dimentions, so we can just
		// use one of them to set width, height and halfpoints for both
		var width = $(hittingTarget).width() - margin.left - margin.right;
		var height = width;

		var halfpoint = (width - margin.left - margin.right) / 2;


		////////////////////////////////////////////////////////////////////////
		///// SCALES AND AXIS FOR HITTERS //////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		// SCALES FOR HITTING CHART

		var xScaleHitting = d3.scaleLinear()
			.domain ([0, d3.max(allHittingData, function(d) {return d.lc_batting_average;})])
			.range([0, width]);

		var yScaleHitting = d3.scaleLinear()
			.domain ([0, d3.max(allHittingData, function(d) {
				return d.lc_runs_produced;
			})])
			.range([height, 0]);


		// AXIS FOR HITTERS

		var xAxisHitting = d3.axisBottom(xScaleHitting).tickValues([.100,.200,.300]).tickFormat(function(d) {return hittingFormat(d).slice(1);}).tickSize(-height);
		var yAxisHitting = d3.axisLeft(yScaleHitting).ticks(6).tickSize(-width);



		////////////////////////////////////////////////////////////////////////
		///// SCALES AND AXIS FOR PITCHERS /////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		// SCALES FOR THE PITCHING CHART

		var xScalePitching = d3.scaleLinear()
				.domain ([0, d3.max(allPitchingData, function(d) {return d.lc_inning_pitched;})])
				.range([0, width]);

		var yScalePitching = d3.scaleLinear()
			.domain ([0, d3.max(allPitchingData, function(d) {
				return d.lc_era;
			})])
			.range([height, 0]);


		// AXIS FOR THE PITCHING CHART

		var xAxisPitching = d3.axisBottom(xScalePitching).ticks(6).tickSize(-height);
		var yAxisPitching = d3.axisLeft(yScalePitching).tickValues([2.00, 4.00, 6.00, 8.00, 10.00]).tickSize(-width).tickFormat(function(d) {return pitchingFormat(d);});



		////////////////////////////////////////////////////////////////////////
		///// DRAWING THE SVG ELEMENTS FOR HITTERS /////////////////////////////
		////////////////////////////////////////////////////////////////////////

		// CREATING SVG ELEMENTS FOR THE HITTING CHART

		var hittingSVG = d3.select(hittingTarget).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		hittingSVG.append("rect")
			.attr("x", xScaleHitting(hittingAverages[0]))
			.attr("y", 0)
			.attr("width", width - xScaleHitting(hittingAverages[0]))
			.attr("height", height - (height - yScaleHitting(hittingAverages[1])))
			.attr("fill", "rgb(225,225,225)");

		hittingSVG.append("g")
			.attr("class", "x axis")
			.attr("id", "axis-x")
			.attr("transform", "translate(0," + height +")")
			.call(xAxisHitting);

		hittingSVG.append("g")
			.attr("class", "y axis")
			.attr("id", "axis-y")
			.call(yAxisHitting);

		// DRAWING THE AVERAGE LINES FOR THE HITTING CHART

		hittingSVG.append("line")
			.attr("x1", xScaleHitting(hittingAverages[0]))
			.attr("y1", 0)
			.attr("x2", xScaleHitting(hittingAverages[0]))
			.attr("y2", height)
			.attr("stroke-width", 2)
			.attr("class", "avgPAs")
			.attr("stroke", "#424242");

		hittingSVG.append("line")
			.attr("x1", 0)
			.attr("y1", yScaleHitting(hittingAverages[1]))
			.attr("x2", width)
			.attr("y2", yScaleHitting(hittingAverages[1]))
			.attr("stroke-width", 2)
			.attr("class", "avgRunsProd")
			.attr("stroke", "#424242");

		// DRAWING THE DOTS AND LABELS FOR THE HITTING CHART

		var leagueHitters = hittingSVG.selectAll(".dot")
			.data(leagueHittingData)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScaleHitting(d.lc_batting_average);
			})
			.attr("cy", function(d) {
				return yScaleHitting(d.lc_runs_produced);
			})
			.attr("class", "dot")
			.attr("r", 6);

		var rangersHitters = hittingSVG.selectAll(".ranger")
			.data(rangersHittingData)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScaleHitting(d.lc_batting_average);
			})
			.attr("cy", function(d) {
				return yScaleHitting(d.lc_runs_produced);
			})
			.attr("class", "ranger")
			.attr("r", 6);

		var rangersHittingLabels = hittingSVG.selectAll(".ranger-label")
			.data(rangersHittingData)
			.enter()
			.append("text")
			.attr("text-anchor", function(d) {
				if (d.player === "Jurickson Profar") {
					return "start";
				} else {
					return "end";
				}
			})
			.attr("x", function(d) {
				if (d.player==="Jurickson Profar") {
					return xScaleHitting(d.lc_batting_average) + 8;
				} else {
					return xScaleHitting(d.lc_batting_average) - 8;
				}
			})
			.attr("y", function(d) {
				if (d.player === "Mitch Moreland" || d.player === "Jurickson Profar") {
					return yScaleHitting(d.lc_runs_produced) - 4;
				} else {
					return yScaleHitting(d.lc_runs_produced) + 4;
				}
			})
			.attr("class", "ranger-label")
			.text(function(d) {
				var name = d.player.split(" ");
				return name[1];
			});

		// DRAWING THE HITTING CHART LABELS

		hittingSVG.append("text")
		  .attr("text-anchor", "middle")
		  .attr("x", height / 2 * -1)
		  .attr("y", -40)
		  .attr("transform", "rotate(-90)")
		  .attr("class", "axis-label")
		  .text("Late and Close Runs Produced");

		hittingSVG.append("text")
		  .attr("text-anchor", "middle")
		  .attr("y", height + 30)
		  .attr("x", width / 2)
		  .attr("class", "axis-label")
		  .text("Late and Close Batting Avg.");





		////////////////////////////////////////////////////////////////////////
		///// DRAWING THE SVG ELEMENTS FOR PITCHERS ////////////////////////////
		////////////////////////////////////////////////////////////////////////

		// CREATING SVG ELEMENTS FOR THE PITCHING CHART

		var pitchingSVG = d3.select(pitchingTarget).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		pitchingSVG.append("rect")
			.attr("x", xScalePitching(pitchingAverages[0]))
			.attr("y", yScalePitching(pitchingAverages[1]))
			.attr("width", width - xScalePitching(pitchingAverages[0]))
			.attr("height", height - yScalePitching(pitchingAverages[1]))
			.attr("fill", "rgb(225,225,225)");

		pitchingSVG.append("g")
			.attr("class", "x axis")
			.attr("id", "axis-x")
			.attr("transform", "translate(0," + height +")")
			.call(xAxisPitching);

		pitchingSVG.append("g")
			.attr("class", "y axis")
			.attr("id", "axis-y")
			.call(yAxisPitching);

		// CREATING AVERAGE LINES FOR THE PITCHING CHART

		pitchingSVG.append("line")
			.attr("x1", xScalePitching(pitchingAverages[0]))
			.attr("y1", 0)
			.attr("x2", xScalePitching(pitchingAverages[0]))
			.attr("y2", height)
			.attr("stroke-width", 2)
			.attr("class", "avgIPs")
			.attr("stroke", "#424242");

		pitchingSVG.append("line")
			.attr("x1", 0)
			.attr("y1", yScalePitching(pitchingAverages[1]))
			.attr("x2", width)
			.attr("y2", yScalePitching(pitchingAverages[1]))
			.attr("stroke-width", 2)
			.attr("class", "avgERA")
			.attr("stroke", "#424242");


		// DRAWING THE DOTS AND LABELS FOR THE PITCHING CHART

		var leaguePitchers = pitchingSVG.selectAll(".dot")
			.data(leaguePitchingData)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScalePitching(d.lc_inning_pitched);
			})
			.attr("cy", function(d) {
				return yScalePitching(d.lc_era);
			})
			.attr("class", "dot")
			.attr("r", 6);

		var rangersPitchers = pitchingSVG.selectAll(".ranger")
			.data(rangersPitchingData)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScalePitching(d.lc_inning_pitched);
			})
			.attr("cy", function(d) {
				return yScalePitching(d.lc_era);
			})
			.attr("class", "ranger")
			.attr("r", 6);

		var rangersPitchingLabels = pitchingSVG.selectAll(".ranger-label")
			.data(rangersPitchingData)
			.enter()
			.append("text")
			.attr("text-anchor", function(d) {
				if (d.player === "Tony Barnette") {
					return "end";
				} else {
					return "start";
				}
			})
			.attr("x", function(d) {
				if (d.player==="Tony Barnette") {
					return xScalePitching(d.lc_inning_pitched) - 8;
				} else {
					return xScalePitching(d.lc_inning_pitched) + 8;
				}
			})
			.attr("y", function(d) {
				return yScalePitching(d.lc_era) + 4;
			})
			.attr("class", "ranger-label")
			.text(function(d) {
				var name = d.player.split(" ");
				return name[1];
			});


		// CREATING LABELS FOR THE PITCHING CHART

		pitchingSVG.append("text")
		  .attr("text-anchor", "middle")
		  .attr("x", height / 2 * -1)
		  .attr("y", -40)
		  .attr("transform", "rotate(-90)")
		  .attr("class", "axis-label")
		  .text("Late and Close ERA");

		pitchingSVG.append("text")
		  .attr("text-anchor", "middle")
		  .attr("y", height + 30)
		  .attr("x", width / 2)
		  .attr("class", "axis-label")
		  .text("Late and Close Inn. Pitched (Min: 10)");




		////////////////////////////////////////////////////////////////////////
		///// UPDATING THE CHARTS WITH THE DROPDOWN ////////////////////////////
		////////////////////////////////////////////////////////////////////////

		d3.selectAll(".late-li")
			.on("click", function() {

				d3.selectAll(".custom-list").classed("no-show", true);

				// dumping out our filtered data and starting from scratch
				var filteredHitters = [];
				var filteredPitchers = [];

				// grab the selected option element, then drill down to it's data-team attribute
				var selectedTeam = d3.select(this).attr("data-team");
				var mascot = d3.select(this).text();

				d3.select(".late-team").text(mascot);
				// checking to see if we've selected "all teams". If we have, set the
				// filtered data arrays to the entire data set
				if (selectedTeam === "ALL") {
					filteredHitters = leagueHittingData;
					filteredPitchers = leaguePitchingData;
				} else {

					// go through the hitting and pitching data and populate the
					// filtered data arrays with players that match the selected team
					$.each(leagueHittingData, function(k,v) {
						if (v.team === selectedTeam) {
							filteredHitters.push(v);
						}
					});

					$.each(leaguePitchingData, function(k,v) {
						if (v.team === selectedTeam) {
							filteredPitchers.push(v);
						}
					});

				}

				// rebind the new hitting data to the dots
				hittingSVG.selectAll(".dot")
					.data(filteredHitters)
					.transition()
					.duration(500)
					.attr("cx", function(d) {
						return xScaleHitting(d.lc_batting_average);
					})
					.attr("cy", function(d) {
						return yScaleHitting(d.lc_runs_produced);
					})
					.attr("class", function(d) {
						return "dot";
					});

				// enter any new circles for hitters that do not currently exist
				hittingSVG.selectAll(".dot")
					.data(filteredHitters)
					.enter()
					.append("circle")
					.attr("class", "dot")
					.attr("cx", function(d) {
						return xScaleHitting(d.lc_batting_average);
					})
					.attr("cy", function(d) {
						return yScaleHitting(d.lc_runs_produced);
					})
					.attr("class", function(d) {
						return "dot";
					})
					.attr("r", 6)
					.attr("fill", "red");

				// remove any circles for hitters that are no longer needed
				hittingSVG.selectAll(".dot")
					.data(filteredHitters)
					.exit().remove();


				// rebind the new pitching data to the dots
				pitchingSVG.selectAll(".dot")
					.data(filteredPitchers)
					.transition()
					.duration(500)
					.attr("cx", function(d) {
						return xScalePitching(d.lc_inning_pitched);
					})
					.attr("cy", function(d) {
						return yScalePitching(d.lc_era);
					})
					.attr("class", function(d) {
						if (d.team === "TEX") {
							return "dot ranger";
						} else {
							return "dot";
						}
					});

				// enter any new circles for pitchers that don't exist yet
				pitchingSVG.selectAll(".dot")
					.data(filteredPitchers)
					.enter()
					.append("circle")
					.attr("class", "dot")
					.attr("cx", function(d) {
						return xScalePitching(d.lc_inning_pitched);
					})
					.attr("cy", function(d) {
						return yScalePitching(d.lc_era);
					})
					.attr("class", function(d) {
						if (d.team === "TEX") {
							return "dot ranger";
						} else {
							return "dot";
						}
					})
					.attr("r", 6)
					.attr("fill", "red");


				// remove any circles for pitchers that are no longer needed
				pitchingSVG.selectAll(".dot")
					.data(filteredPitchers)
					.exit().remove();

			});

	}



	$("#late-selector").click(function(event) {
		event.stopPropagation();
		$("#late-selector").siblings("ul").removeClass("no-show");
	});

	$("#late-selector li").click(function(event) {
		$("#late-selector ul").addClass("no-show");
	});


	// setting up our placeholder arrays for the data that will be gathered by the
	// json calls below

	var lateHitters = [];
	var latePitchers = [];

	var leagueHitters = [];
	var rangersHitters = [];

	var leaguePitchers = [];
	var rangersPitchers = [];

	var hittingAverages = [];
	var pitchingAverages = [];

	// this is our late and close queue. We don't want to run our drawing function until
	// the data for both hitters and pitchers has been returned. We start at 0.
	// Each json call below will increment this value by one, and once it equals 2,
	// the drawing function will be called

	var lcQueue = 0;

	$.getJSON("assets/python-scripts/json/runs-late-and-close.json", function(data) {

		lateHitters = data;

		// setting up the variables that will be used to figure out our group averages
		var totalHits = 0;
		var totalABs = 0;
		var totalRunsProd = 0;

		// run through the players in the data, and push them to either league or rangers
		// data arrays based on what team they play for
		$.each(data, function(k,v) {
			if (v.team !== "TEX") {
				leagueHitters.push(v);
			} else {
				rangersHitters.push(v);
			}

			// increment the average variables accordingly
			totalHits += v.lc_hits;
			totalABs += v.lc_ab;
			totalRunsProd += v.lc_runs_produced;

		});

		// figure our averages
		var avgRunsProd = totalRunsProd / data.length;
		var avgAvg = totalHits / totalABs;

		// populate our averages array with the average values
		hittingAverages[1] = avgRunsProd;
		hittingAverages[0] = avgAvg;

		// increment our queue variable
		lcQueue++;

		// draw the scatter plots if both json calls have completed
		if (lcQueue === 2) {
			drawLC(leagueHitters, rangersHitters, lateHitters, hittingAverages, "#late-and-close-hitting", leaguePitchers, rangersPitchers, latePitchers, pitchingAverages, "#late-and-close-pitching");
		}

	});

	$.getJSON("assets/python-scripts/json/pitchers-late-and-close.json", function(data) {
		latePitchers = data;

		// setting up the variables that will be used to figure out our group averages
		var totalERs = 0;
		var wholeInns = 0;
		var partialInns = 0;

		// run through the players in the data, and push them to either league or rangers
		// data arrays based on what team they play for
		$.each(data, function(k,v) {
			if (v.team !== "TEX") {
				leaguePitchers.push(v);
			} else {
				rangersPitchers.push(v);
			}

			// because innings pitched uses a weird .1, .2 system to record outs, we have to do some Math
			// so, we round the innings pitched down to get the total number of whole innings
			var wholeIPs = Math.floor(v.lc_inning_pitched);

			// then we figure out how many outs those partial innings add up to.
			var partialIPs = Math.floor((v.lc_inning_pitched - wholeIPs) * 10);

			// sum our total earned runs
			totalERs += v.lc_earned_runs;

			// sum our total whole innings and partial innings
			wholeInns += wholeIPs;
			partialInns += partialIPs;

		});

		// calculate how many outs all the pitchers pitched combined by multiplying
		// the whole innings by three then adding the partial innings (outs) in
		var totalOuts = (wholeInns * 3) + partialInns;

		// then convert that back to innings by dividing by three
		var totalIPs = totalOuts / 3;

		// calculate our group earned run average
		var avgERA = (9 * (totalERs / totalIPs));
		avgERA = Math.round(avgERA * 100) / 100;

		// calculate the average innings pitched
		var avgIPs = totalIPs / data.length;

		// populate our averages array with the average values
		pitchingAverages[0] = avgIPs;
		pitchingAverages[1] = avgERA;

		// increment our queue variable
		lcQueue++;

		// draw the scatter plots if both json calls have completed
		if (lcQueue === 2) {
			drawLC(leagueHitters, rangersHitters, lateHitters, hittingAverages, "#late-and-close-hitting", leaguePitchers, rangersPitchers, latePitchers, pitchingAverages, "#late-and-close-pitching");
		}
	});

});
