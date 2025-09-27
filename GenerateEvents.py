import requests
from serpapi import GoogleSearch
import json
import datetime

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

def get_events(location_label):
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

    return events

def get_events_for_today(event_results):
  today = datetime.date.today().strftime("%b %d")

  current_events = []

  for event in event_results:
    if event['date'] == today:
      current_events.append(event)

  return current_events

def generate_events():
    # 🔹 Example coordinates (Center City West)
    lat = 39.95307654455367
    lon = -75.2120968398999
    google_maps_api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"

    neighborhood, locality = get_location_labels(lat, lon, google_maps_api_key)

    print("Neighborhood:", neighborhood)
    print("Locality:", locality)

    try:
        all_events = get_events(neighborhood)
        currentEvents = get_events_for_today(all_events)
        with open("events_today.json", "w") as f:
            json.dump(currentEvents, f, indent=2)
    except:
        all_events = get_events(locality)
        currentEvents = get_events_for_today(all_events)
        with open("events_today.json", "w") as f:
            json.dump(currentEvents, f, indent=2)
