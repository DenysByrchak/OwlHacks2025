from serpapi import GoogleSearch
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GOOGLE_SEARCH_API_KEY

def get_food(location):
  params = {
    "api_key": GOOGLE_SEARCH_API_KEY,
    "engine": "google",
    "q": "Food",
    "google_domain": "google.com",
    "gl": "us",
    "hl": "en",
    "location": location
  }

  search = GoogleSearch(params)
  results = search.get_dict()
  food_results = results["local_results"]
  return food_results


