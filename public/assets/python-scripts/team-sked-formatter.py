#imports
import csv
import json

#teams = ["ANA", "HOU", "OAK", "TOR", "ATL", "MIL", "STL", "CHC", "ARI", "LAD", "SFG", "CLE", "SEA", "FLA", "NYM", "WSN", "BAL", "SDP", "PHI", "PIT", "TBD", "BOS", "CIN", "COL", "KCR", "DET", "MIN", "CHW", "NYY"]

teams = ["ANA", "HOU", "OAK"]

################################################################################
    # FORMATTING GAME LOG DATA
################################################################################

# game logs are supplied via csv by baseball-reference: http://www.baseball-reference.com/teams/TEX/2016-schedule-scores.shtml

for team in teams:
    # opening up the csv and saving the contents into a DictReader
    game_log_csv = open('/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/csv/team-skeds/' + team + '-sked.csv', 'rb')
    game_logs = csv.DictReader(game_log_csv)

    # placeholder list that will hold our formatted data
    team_game_log = []

    # let's go through each game in the game log and format the data
    for game in game_logs:

        # checks to see if the "Rk" value is "Rk". In our csv, the header rows are repeated
        # every so often, so we want to skip those and keep going
        if game["Rk"] == "Rk":
            continue

        # set variables for walk_off wins, one_run_wins and ninth_inning_comebacks
        walk_off = False
        one_run_win = False

        # if the game's w/l column contains "W-wo", it's a walk-off win; set that variable to true
        if game["W/L"] == "W-wo":
            walk_off = True

        # pull the runs for and runs against values
        runs = game["R"]
        runs_against = game["RA"]

        # convert those values to integers so we can compare them
        runs = int(runs)
        runs_against = int(runs_against)

        # check to see if runs minus runs against is 1. if so, set one_run_wins variable to true
        if runs - runs_against == 1:
            one_run_win = True;

        # set up the dictionary for the current game in the list
        current_game = {
            "game-number": game["Gm#"],
            "opponent": game["Opp"],
            "win_loss": game["W/L"][0],
            "walk_off": walk_off,
            "one_run_win": one_run_win,
            "game_date": game["Date"],
            "runs": game["R"],
            "runs_against": game["RA"],
        }

        # add that dictionary to the rang_game_log list
        team_game_log.append(current_game)


    # open up the file we'll dump our data into
    game_log_dict = open("/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/json/team-skeds/" + team + "-game-logs.json", "w")

    # dump our data, with some prettified parameters
    json.dump(team_game_log, game_log_dict, sort_keys=True, indent=4)

    # close the file
    game_log_dict.close()
