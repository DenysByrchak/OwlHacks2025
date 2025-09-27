import requests
import json
from geopy.distance import geodesic
from datetime import datetime

def geocode_address(address_lines, api_key):
    address = ", ".join(address_lines)
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
    response = requests.get(url).json()
    results = response.get("results", [])
    if results:
        loc = results[0]["geometry"]["location"]
        return (loc["lat"], loc["lng"])
    return None

def sort_events():
    google_maps_api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"
    user_location = (39.981650629014474, -75.15328528534144)  # Example: North Philly

    # 🔹 Load events
    with open("events_today.json", "r") as f:
        events = json.load(f)
    # 🔁 Add distance to each event
    for event in events:
        event_location = geocode_address(event["address"], google_maps_api_key)
        if event_location:
            event["distance_km"] = geodesic(user_location, event_location).km
        else:
            event["distance_km"] = float("inf")  # fallback if geocoding fails

    # 🔽 Sort by distance
    events_sorted = sorted(events, key=lambda x: x["distance_km"])

    # 💾 Save sorted list
    with open("events_sorted_for_today.json", "w") as f:
        json.dump(events_sorted, f, indent=2)

    print("Sorted events saved to events_sorted_for_today.json")
    
def filter_and_sort_events(events, excluded_time):
    # 🔹 Remove events that start at the excluded time
    filtered = [event for event in events if event.get("time") != excluded_time]

    # 🔽 Sort remaining events by distance
    sorted_events = sorted(filtered, key=lambda x: x.get("distance_km", float("inf")))

    return sorted_events

def remove_time(start_time_str, end_time_str):
    # 🔹 Load your event data
    with open("events_sorted_for_today.json", "r") as f:
        events = json.load(f)

    # 🔹 Convert time strings to datetime objects
    time_format = "%I:%M %p"
    start_time = datetime.strptime(start_time_str, time_format).time()
    end_time = datetime.strptime(end_time_str, time_format).time()

    # 🔹 Filter out events within the time range
    filtered_events = []
    for event in events:
        try:
            event_time = datetime.strptime(event["time"], time_format).time()
            if not (start_time <= event_time <= end_time):
                filtered_events.append(event)
        except Exception as e:
            print(f"Skipping event due to time parse error: {event.get('title')}")
    
    with open("events_sorted_for_today.json", "w") as f:
        json.dump(filtered_events, f, indent=2)        
    
    print(f"Saved filtered events to events_sorted_for_today.json (excluded range: {start_time_str}–{end_time_str})")