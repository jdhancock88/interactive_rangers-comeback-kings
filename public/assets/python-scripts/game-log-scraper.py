#imports
import requests
from bs4 import BeautifulSoup
import re
import json
from operator import itemgetter
import pprint as pprint

teams = ["BOS", "BAL", "TOR", "NYY", "TBR", "CLE", "DET", "KCR", "CHW", "MIN", "SEA", "HOU", "OAK", "LAA", "WSN", "NYM", "MIA", "PHI", "ATL", "CHC", "STL", "PIT", "MIL", "CIN", "LAD", "SFG", "COL", "SDP", "ARI"]

# teams = ["LAA"]

for team in teams:
    print(team)

    team_sked = []

    #this is the url we want plus team
    url = "http://www.baseball-reference.com/teams/" + team + "/2016-schedule-scores.shtml"
    #requests
    url_r = requests.get(url)
    #run the requests through soup
    soup = BeautifulSoup(url_r.content, "html.parser")
    #the table with our data
    sked_table = soup.find("table",{"id":"team_schedule"})
    #print(table)
    sked_table_body = sked_table.find("tbody")
    sked_rows = sked_table_body.findAll("tr")


    for row in sked_rows:

        cells = row.findAll("td")
        if len(cells) > 0 and cells[3].text == "boxscore":
            walk_off = False
            one_run_win = False
            one_run_loss = False

            if int(cells[8].text) - int(cells[9].text) == 1:
                one_run_win = True

            if int(cells[9].text) - int(cells[8].text) == 1:
                one_run_loss = True

            if cells[7].text == "W-wo":
                walk_off = True

            # set up the dictionary for the current game in the list
            current_game = {
                "team": team,
                "game-number": cells[1].text,
                "opponent": cells[6].text,
                "win_loss": cells[7].text[0],
                "walk_off": walk_off,
                "one_run_win": one_run_win,
                "one_run_loss": one_run_loss,
                "game_date": cells[2].text,
                "runs": cells[8].text,
                "runs_against": cells[9].text
            }
        else:
            continue

        team_sked.append(current_game)

        # open up the file we'll dump our data into
        game_log_dict = open("/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/json/team-skeds/" + team + "-game-logs.json", "w")

        # dump our data, with some prettified parameters
        json.dump(team_sked, game_log_dict, sort_keys=True, indent=4)

        # close the file
        game_log_dict.close()
