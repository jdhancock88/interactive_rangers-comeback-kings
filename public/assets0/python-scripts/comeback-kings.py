import csv
import json

################################################################################
    # FORMATTING GAME LOG DATA
################################################################################

# game logs are supplied via csv by baseball-reference: http://www.baseball-reference.com/teams/TEX/2016-schedule-scores.shtml

# opening up the csv and saving the contents into a DictReader
game_log_csv = open('/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/csv/game-log.csv', 'rb')
game_logs = csv.DictReader(game_log_csv)

# placeholder list that will hold our formatted data
rang_game_log = []

# comeback games. These are the game numbers of games where the Rangers won despite
# starting the ninth inning losing. unfortunately, these have to be sussed out by hand
comeback_games = ["62", "69", "77", "100", "113", "133", "146"]

# let's go through each game in the game log and format the data
for game in game_logs:

    # checks to see if the "Rk" value is "Rk". In our csv, the header rows are repeated
    # every so often, so we want to skip those and keep going
    if game["Rk"] == "Rk":
        continue

    # set variables for walk_off wins, one_run_wins and ninth_inning_comebacks
    walk_off = False
    one_run_win = False
    ninth_comeback = False

    # if the game's w/l column contains "W-wo", it's a walk-off win; set that variable to true
    if game["W/L"] == "W-wo":
        walk_off = True

    # if the game number column is in the comeback_games list above, it's a ninth-inning
    # comeback win. set that variable to true
    if game["Gm#"] in comeback_games:
        ninth_comeback = True

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
        "comeback": ninth_comeback
    }

    # add that dictionary to the rang_game_log list
    rang_game_log.append(current_game)


# open up the file we'll dump our data into
game_log_dict = open("/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/json/rangers-game-logs.json", "w")

# dump our data, with some prettified parameters
json.dump(rang_game_log, game_log_dict, sort_keys=True, indent=4)

# close the file
game_log_dict.close()



################################################################################
    # TALLYING UP PLAYER BATTING DATA FOR NINTH-INNING COMEBACKS
################################################################################


# opening up the player_batting csv and saving it to a dict reader. Note: this
# data was gathered by hand
player_batting_csv = open("/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/csv/ninth-comebacks.csv", "rb")
player_batting = csv.DictReader(player_batting_csv)

# placeholder lists for our final batting data and player names. We'll use the player
# names list to check against the csv data as we're totalling up player stats
batting_data = []
players = []

# looping over the player_batting csv
for player in player_batting:

    # pulling out the player's name for ease of use later
    name = player["Player"]

    # check if the player's name is listed in the players list.
    if player["Player"] in players:

        # if it is, grab the index, and use that update the key/values for that
        # dicitionary in the batting_data list
        i = players.index(name)
        batting_data[i]["at-bats"] += int(player["AB"])
        batting_data[i]["hits"] += int(player["H"])
        batting_data[i]["runs"] += (int(player["R"]) + int(player["PR"]))
        batting_data[i]["rbis"] += int(player["RBI"])
        batting_data[i]["doubles"] += int(player["D"])
        batting_data[i]["triples"] += int(player["T"])
        batting_data[i]["home_runs"] += int(player["HR"])
        batting_data[i]["base_on_balls"] += int(player["BB"])
        batting_data[i]["plate_apps"] += 1
    else:

        # if the player's name is not in the players list, this is the first time
        # we've come to that player. Add his name to the list, and build out the
        # initial dicitionary for that player in batting_data
        players.append(name)
        current_player = {
            "player": player["Player"],
            "at-bats": int(player["AB"]),
            "hits": int(player["H"]),
            "runs": (int(player["R"]) + int(player["PR"])),
            "rbis":  int(player["RBI"]),
            "doubles":  int(player["D"]),
            "triples":  int(player["T"]),
            "home_runs":  int(player["HR"]),
            "base_on_balls":  int(player["BB"]),
            "plate_apps":  1
        }

        # add that player's dicitionary to batting_data
        batting_data.append(current_player)


# open up the file we'll dump our data into
player_batting_dict = open("/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/json/player-batting.json", "w")

# dump our data
json.dump(batting_data, player_batting_dict, sort_keys=True, indent=4)

# close the file
player_batting_dict.close()

# team abbreviations. these are used to scrape through baseball-reference's scores
# and lead summaries to grab record and w/l percentage for teams when behind in 9th inning
teams_abbreviations = ["ANA", "HOU", "OAK", "TOR", "ATL", "MIL", "STL", "CHC", "ARI", "LAD", "SFG", "CLE", "SEA", "FLA", "NYM", "WSN", "BAL", "SDP", "PHI", "PIT", "TEX", "TBD", "BOS", "CIN", "COL", "KCR", "DET", "MIN", "CHW", "NYY"]
