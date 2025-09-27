from serpapi import GoogleSearch
import datetime
import json

def get_events(location):
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
  return events_results

def get_events_for_today(event_results):
  today = datetime.date.today().strftime("%b %d")

  current_events = []

  for event in event_results:
    if event['date'] == today:
      current_events.append(event)

  return current_events

allEvents = get_events("North Philadelphia")
