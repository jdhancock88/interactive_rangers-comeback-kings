$(document).ready(function(){function e(e){console.log(e);var t=d3.select("#game-log-chart").selectAll(".game-log").data(e);t.enter().append("span").attr("class","game-log")}var t=new Date,a=t.getFullYear();$(".copyright").text(a),$.getJSON("/assets/python-scripts/json/rangers-game-logs.json",function(t){e(t)})});
//# sourceMappingURL=scripts-bundle.js.map
