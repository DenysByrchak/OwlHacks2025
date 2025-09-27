from flask import Flask, send_from_directory, jsonify
import json
from GenerateEvents import generate_events
from SortEvents import sort_events, remove_time

app = Flask(__name__, static_folder="web")

# 🔹 Serve landing page at root
@app.route("/")
def serve_landing():
    return send_from_directory("web/pages", "landing.html")

# 🔹 Serve other HTML pages
@app.route("/<page>")
def serve_page(page):
    return send_from_directory("web/pages", f"{page}.html")

@app.route("/partials/<path:path>")
def serve_partials(path):
    return send_from_directory("web/partials", path)

# 🔹 Serve static assets (CSS, JS, images)
@app.route("/assets/<path:path>")
def serve_assets(path):
    return send_from_directory("web/assets", path)

@app.route("/events")
def serve_events_page():
    return send_from_directory("web/pages", "events.html")

# 🔹 Serve event data
@app.route("/api/events")
def serve_events():
    try:
        with open("events_sorted_for_today.json", "r") as f:
            events = json.load(f)
        return jsonify(events)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# 🔹 Run pipeline before server starts
if __name__ == "__main__":
    print("🚀 Running Philly Tour pipeline before Flask starts...")
    generate_events()
    sort_events()
    #remove_time("2:00 PM", "5:00 PM")

    app.run(debug=True)