import requests
from serpapi import GoogleSearch
import json
import datetime
import sys
import os
from .googleEvents import get_events

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GOOGLE_MAPS_API_KEY, GOOGLE_SEARCH_API_KEY

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


def search_event_url(title, api_key):
    params = {
        "key": api_key,
        "google_domain": "google.com",
        "q": title
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    if "organic_results" in results and results["organic_results"]:
        return results["organic_results"][0].get("link")
    return None


def fix_data(currentEvents):
    for event in currentEvents:
        url = search_event_url(event["title"], GOOGLE_SEARCH_API_KEY)
        event["url"] = url or "Not found"

        if not ("price" in event):
            event["price"] = "Check Website"

    return currentEvents


def generate_events(lat, lon):

    neighborhood, locality = get_location_labels(lat, lon, GOOGLE_MAPS_API_KEY)

    print("Neighborhood:", neighborhood)
    print("Locality:", locality)

    all_events = get_events(neighborhood)
    # TODO rewrite event functions
    # currentEvents = get_events_for_today(all_events)

    with open("events_today.json", "w") as f:
        json.dump(all_events, f, indent=2)

    # currentEvents = all_events
    #
    # if not (currentEvents):
    #     all_events = get_events(locality)
    #     # TODO rewrite event functions
    #     # currentEvents = get_events_for_today(all_events)
    #
    #     currentEvents = fix_data(all_events)
    #
    #     with open("events_today.json", "w") as f:
    #         json.dump(currentEvents, f, indent=2)
    #
    # else:
    #     currentEvents = fix_data(currentEvents)
    #
    #     with open("events_today.json", "w") as f:
    #         json.dump(currentEvents, f, indent=2)

def init_events():
    all_events = get_events("Philadelphia")
    all_events = fix_data(all_events)

    with open("backendEventInfo/events_today.json", "w") as f:
         json.dump(all_events, f, indent=2)