import requests
from serpapi import GoogleSearch
import json

def get_location_labels(lat, lon, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={api_key}"
    response = requests.get(url).json()

    neighborhood = None
    locality = None

    for result in response.get("results", []):
        for comp in result.get("address_components", []):
            if "neighborhood" in comp["types"] and not neighborhood:
                neighborhood = comp["short_name"]
            elif "locality" in comp["types"] and not locality:
                locality = comp["short_name"]

    return neighborhood, locality

def search_events(location_label, output_filename):
    params = {
        "api_key": "668a5dbed851136e8f139735e73e282bd67c328c9d25d355cef71cd8bfbef34e",
        "engine": "google",
        "q": "Events",
        "google_domain": "google.com",
        "gl": "us",
        "hl": "en",
        "location": location_label
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    events = results.get("events_results", [])

    with open(output_filename, 'w') as f:
        json.dump(events, f, indent=2)
    print(f"Saved events to {output_filename}")

# 🔹 Example coordinates (Center City West)
lat = 39.95307654455367
lon = -75.2120968398999
google_maps_api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"

neighborhood, locality = get_location_labels(lat, lon, api_key)

print("Neighborhood:", neighborhood)
print("Locality:", locality)

try:
    search_events(neighborhood, "events_output.json")
except:
    search_events(locality, "events_output.json")