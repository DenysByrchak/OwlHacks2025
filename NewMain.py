import requests
from serpapi import GoogleSearch

def get_city_name(lat, lon, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={api_key}"
    response = requests.get(url).json()
    for result in response.get("results", []):
        for comp in result.get("address_components", []):
            if "locality" in comp["types"]:
                return comp["long_name"]
    return None

# 🔹 Your target coordinates (e.g., North Philly)
lat = 39.981650629014474
lon = -75.15328528534144
google_maps_api_key = "AIzaSyBs86ACXN8GZfcrTzaTgenOFwaXJ-HmQIQ"

# 🔹 Extract city name
city_name = get_city_name(lat, lon, google_maps_api_key)

# 🔹 Plug into SerpAPI search
def search_events(location_label):
    params = {
        "api_key": api_key,
        "engine": "google",
        "q": "Events",
        "google_domain": "google.com",
        "gl": "us",
        "hl": "en",
        "location": location_label
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    return results.get("events_results", [])

# 🔹 Try neighborhood
try:
    neighborhood_results = search_events("Fishtown, Philadelphia")
    print("Neighborhood (Fishtown):", neighborhood_results)

except:
    locality_results = search_events("Philadelphia")

    print("Locality (Philadelphia):", locality_results)
