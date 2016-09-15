#imports
import requests
from bs4 import BeautifulSoup
import re
import json
from operator import itemgetter

teams = ["ANA", "HOU", "OAK", "TOR", "ATL", "MIL", "STL", "CHC", "ARI", "LAD", "SFG", "CLE", "SEA", "FLA", "NYM", "WSN", "BAL", "SDP", "PHI", "PIT", "TEX", "TBD", "BOS", "CIN", "COL", "KCR", "DET", "MIN", "CHW", "NYY"]

#going to hold each teams data object
teamStats = []

for team in teams:
    print(team)

    #this will hold each teams data
    teamObj = {}

    #this is the url we want plus team
    url = "http://www.baseball-reference.com/play-index/inning_summary.cgi?year=2016&team_id="+team+"&submitter=1"
    #requests
    url_r = requests.get(url)
    #run the requests through soup
    soup = BeautifulSoup(url_r.content, "html.parser")
    #the table with our data
    table = soup.find("table",{"id":"record_by_inning"})
    #print(table)
    rows = table.findAll("tr")
    #rows[10] is the 9th inning
    cells = rows[10].findAll("td")
    #print(cells[7].text)

    #these are where the data lives
    behindWins = cells[7].text
    behindLoss = cells[8].text
    behindPct = cells[9].text

    #assign to teamObj
    teamObj["id"] = team
    teamObj["behindWins"] = behindWins
    teamObj["behindLoss"] = behindLoss
    teamObj["behindPct"] = behindPct

    #append each obj to teamstats array
    teamStats.append(teamObj)

team_comeback_wins = sorted(teamStats, key=itemgetter("behindPct"), reverse=True)

#declare files, w+ create if don't exist
j = open( "json/ninthInning.json","w+")

#minified
#json.dump(d, j, sort_keys=True, separators=(',',':'))

#prettified
json.dump(team_comeback_wins, j, sort_keys=True, indent=4)

j.close()
