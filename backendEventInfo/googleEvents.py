from serpapi import GoogleSearch
import datetime
import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GOOGLE_SEARCH_API_KEY

def get_events(location):
  params = {
    "api_key": GOOGLE_SEARCH_API_KEY,
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

