from serpapi import GoogleSearch

def get_food(location):
  params = {
    "api_key": "668a5dbed851136e8f139735e73e282bd67c328c9d25d355cef71cd8bfbef34e",
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


