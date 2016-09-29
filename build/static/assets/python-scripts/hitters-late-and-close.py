#imports
import requests
from bs4 import BeautifulSoup
import re
import json
from operator import itemgetter


# the list of our team abbreviations as they appear in the dropdown at baseball-reference's
# batting split finder submission form

teams = ["BOS", "BAL", "TOR", "NYY", "TBD", "CLE", "DET", "KCR", "CHW", "MIN", "SEA", "HOU", "OAK", "ANA", "WSN", "NYM", "FLA", "PHI", "ATL", "CHC", "STL", "PIT", "MIL", "CIN", "LAD", "SFG", "COL", "SDP", "ARI", "TEX"]

# the minimum amount of plate appearances for our data
min_pa = "200"

# players will be the list that holds all of our player objects after the scrape completes
players = []

# iterate over our teams list
for team in teams:

    # print the team so we know which team is thorwing an error if we have one
    print(team)

    # the api url for baseball reference's batting split finder, passing in the team
    # and the minimum number of plate appearances
    url = "http://www.baseball-reference.com/play-index/split_finder.cgi?gotresults&type=b&as=result_batter&offset=0&match=season&min_year_game=2016&max_year_game=2016&team_id="+team+"&min_season=1&max_season=-1&min_age=0&max_age=99&isActive=either&bats=any&split_1=situa%3Aclutc&sid_situa%3Aleado=situa%3Aleado%3Aany&sid_outcb%3Aoutcb=outcb%3Aoutcb%3Aany&sid_oppon%3Aoppon=oppon%3Aoppon%3Aany&sid_situa%3Atimes=situa%3Atimes%3Aany&sid_plato%3Aplato=plato%3Aplato%3Aany&sid_situa%3Abases=situa%3Abases%3Aany&sid_defp%3Adefp=defp%3Adefp%3Aany&sid_opptp%3Agbfb=opptp%3Agbfb%3Aany&sid_opptp%3Apower=opptp%3Apower%3Aany&sid_hitty%3Atraj=hitty%3Atraj%3Aany&sid_lineu%3Alineu=lineu%3Alineu%3Aany&sid_total%3Atotal=total%3Atotal%3Aany&sid_dates%3Ahalf=dates%3Ahalf%3Aany&sid_locat%3Astad=locat%3Astad%3Aany&sid_situa%3Ainnng=situa%3Ainnng%3Aany&sid_locat%3Asite=locat%3Asite%3Aany&sid_dates%3Amonth=dates%3Amonth%3Aany&sid_situa%3Acount=situa%3Acount%3Aany&sid_situa%3Aouts=situa%3Aouts%3Aany&sid_locat%3Ahmvis=locat%3Ahmvis%3Aany&sid_wpa%3Alever=wpa%3Alever%3Aany&sid_role%3Astsub=role%3Astsub%3Aany&sid_hitty%3Ahitlo=hitty%3Ahitlo%3Aany&sid_situa%3Aclutc=situa%3Aclutc%3ALate+%26+Close&exclude_incomplete=1&sr_compare_total=1&c0criteria=PA&c0gtlt=gt&c0val="+min_pa+"&number_matched=1&orderby=BA&sr_split_totals_choice=by_split&c1gtlt=eq&c1val=0&c2gtlt=eq&c2val=0&c3gtlt=eq&c3val=0&c4gtlt=eq&c4val=0&c5gtlt=eq&c5val=1.0&location=pob&locationMatch=is&pob=&pod=&pcanada=&pusa=&ajax=1&submitter=1&z=1&z=1&_=1475071362893"

    #requests
    url_r = requests.get(url)

    #run the requests through soup
    soup = BeautifulSoup(url_r.content, "html.parser")

    #the table with our data
    table = soup.find("table",{"id":"ajax_result_table"})

    #drilling down to the body of the table and it's rows, which has all the
    # players that we are looking for
    players_table_body = table.find("tbody")
    player_rows = players_table_body.findAll("tr")

    # iterate over each row in the table
    for row in player_rows:

        # reformat our team abbreviation to match our dropdowns in our data viz
        if team == "ANA":
            team = "LAA"

        if team == "TBD":
            team = "TBR"

        if team == "FLA":
            team = "MIA"

        # assign all the cells in each row to the cells varaiable
        cells = row.findAll("td")

        # create a dict for each player, with values for their team, name,
        # and late and close batting average, plate appearances, home runs and rbis
        playerObj = {
            "team": team,
            "player": cells[2].text,
            "lc_batting_average": float(cells[6].text),
            "lc_plate_app": int(cells[9].text),
            "lc_hr": int(cells[16].text),
            "lc_rbi": int(cells[17].text),
            "lc_hits": int(cells[13].text),
            "lc_ab": int(cells[11].text)
        }

        # if those plate appearances are 50 or more, add them to the players list
        if playerObj["lc_plate_app"] >= 50:
            players.append(playerObj)


#declare files, w+ create if don't exist
j = open( "/Users/johnhancock/Desktop/interactives/working/rangers-comeback-kings/build/static/assets/python-scripts/json/hitters-late-and-close.json","w+")

#prettified
json.dump(players, j, sort_keys=True, indent=4)

#close
j.close()
