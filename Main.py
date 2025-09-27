#AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ

print("Hello World")

import requests
from serpapi import GoogleSearch

ip = "129.32.224.68"

import base64


def get_city_name(lat, lon, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={api_key}"
    response = requests.get(url)
    results = response.json().get('results', [])
    for result in results:
        for component in result['address_components']:
            if 'locality' in component['types']:
                return component['long_name']
    return None

def generate_uule(city_name):
    prefix = "w+CAIQICI"
    encoded = base64.b64encode(city_name.encode()).decode()
    return prefix + encoded

def nearby_places(lat, lon, api_key, radius=1000, keyword="museum"):
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lon}&radius={radius}&keyword={keyword}&key={api_key}"
    response = requests.get(url)
    return response.json()

api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"
city = get_city_name(
                           39.981650629014474, -75.15328528534144, api_key)

print("City:", city)
api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"

import json

import requests
import json

api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"

def reverse_geocode(lat, lon, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={api_key}"
    response = requests.get(url)
    return response.json()

# 🗺️ Sample Philly Locations (Center City, Fishtown, West Philly, South Philly, Fairmount)
locations = [
    {"name": "center_city", "lat": 39.9526, "lon": -75.1652},
    {"name": "fishtown", "lat": 39.9696, "lon": -75.1333},
    {"name": "west_philly", "lat": 39.9610, "lon": -75.2195},
    {"name": "south_philly", "lat": 39.9300, "lon": -75.1700},
    {"name": "fairmount", "lat": 39.9681, "lon": -75.1720}
]

# 🔁 Loop through each location and save to file
for loc in locations:
    response = reverse_geocode(loc["lat"], loc["lon"], api_key)
    filename = f'reverse_geocode_{loc["name"]}.json'
    with open(filename, 'w') as f:
        json.dump(response, f, indent=2)
    print(f"Saved {filename}")
    
    
location = "North Philadelphia"

params = {
  "api_key": "668a5dbed851136e8f139735e73e282bd67c328c9d25d355cef71cd8bfbef34e",
  "engine": "google",
  "q": "Events",
  "google_domain": "google.com",
  "gl": "us",
  "hl": "en",
  "location": location
}

search = GoogleSearch(params)
results = search.get_dict()
events_results = results["events_results"]

print(events_results) 