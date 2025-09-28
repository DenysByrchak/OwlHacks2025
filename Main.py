from flask import Flask, send_from_directory, jsonify, request
import json
from GenerateEvents import generate_events
from SortEvents import sort_events, remove_time
import requests

app = Flask(__name__, static_folder="web")

# 🔹 Serve landing page at root
@app.route("/")
def serve_landing():
    return send_from_directory("web/pages", "landing.html")

# 🔹 Serve About page
@app.route("/about")
def serve_about():
    return send_from_directory("web/pages", "about.html")

# 🔹 Serve Account page
@app.route("/account")
def serve_account():
    return send_from_directory("web/pages", "account.html")

# 🔹 Serve Add-to-Schedule page
@app.route("/add-to-schedule")
def serve_add_to_schedule():
    return send_from_directory("web/pages", "add-to-schedule.html")

# 🔹 Serve Events page
@app.route("/events")
def serve_events_page():
    return send_from_directory("web/pages", "events.html")

# 🔹 Serve Schedule page
@app.route("/schedule")
def serve_schedule():
    return send_from_directory("web/pages", "schedule.html")

# 🔹 Serve Partials
@app.route("/partials/<path:path>")
def serve_partials(path):
    return send_from_directory("web/partials", path)

# 🔹 Serve Static Assets
@app.route("/assets/<path:path>")
def serve_assets(path):
    return send_from_directory("web/assets", path)

@app.route('/api/receive-location', methods=['POST'])
def receive_location():
    data = request.get_json()
    lat = data.get('latitude')
    lng = data.get('longitude')
    print(f"Received user location: {lat}, {lng}")
    parse_events(lat, lng)
    
    with open("events_sorted_for_today.json", "r") as f:
        events = json.load(f)
    
    return jsonify({
        'status': 'ok',
        'received': {'lat': lat, 'lng': lng},
        'events': events
    })
    

# 🔹 Serve Event Data API
@app.route("/api/events")
def serve_events():
    try:
        with open("events_sorted_for_today.json", "r") as f:
            events = json.load(f)
        return jsonify(events)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def parse_events(lat, lng):
    print("🚀 Running Philly Tour pipeline sorting")
    generate_events(lat, lng)
    sort_events(lat, lng)
    # remove_time("2:00 PM", "5:00 PM")
    
# 🔹 Run pipeline before server starts
if __name__ == "__main__":
    app.run(debug=True)