from flask import Flask, send_from_directory, jsonify, request, render_template
from flask_login import current_user, login_required
import json
from backendEventInfo.eventData import generate_events, init_events
# from SortEvents import sort_events, remove_time
from backendUserData.loginRoutes import connect_login_routes
from config import SECRET_KEY

app = Flask(__name__, static_folder="web", template_folder="web")
app.secret_key = SECRET_KEY

connect_login_routes(app)


@app.route("/")
def serve_landing():
    return render_template("pages/landing.html", current_user=current_user)


@app.route("/about")
def serve_about():
    return render_template("pages/about.html", current_user=current_user)


@app.route("/account")
def serve_account():
    return render_template("pages/account.html", current_user=current_user)


@app.route("/add-to-schedule")
def serve_add_to_schedule():
    return render_template("pages/add-to-schedule.html", current_user=current_user)


@app.route("/events")
def serve_events_page():
    return render_template("pages/events.html", current_user=current_user)


@app.route("/schedule")
def serve_schedule():
    return render_template("pages/schedule.html", current_user=current_user)


@app.route("/partials/<path:path>")
def serve_partials(path):
    if path == "nav.html":
        return render_template("partials/nav.html", current_user=current_user)
    return send_from_directory("web/partials", path)


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
    
    with open("backendEventInfo/events_today.json", "r") as f:
        events = json.load(f)
    
    return jsonify({
        'status': 'ok',
        'received': {'lat': lat, 'lng': lng},
        'events': events
    })
    

# Used to get current events
@app.route("/api/events")
def serve_events():
    try:
        with open("backendEventInfo/events_today.json", "r") as f:
            events = json.load(f)
        return jsonify(events)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Check if user logged into Google Account
@app.route("/api/user-status")
def user_status():
    return jsonify({
        "authenticated": current_user.is_authenticated,
        "user_id": current_user.id if current_user.is_authenticated else None
    })


@app.route("/api/schedule-event", methods=['POST'])
@login_required
def schedule_event():
    data = request.get_json()
    
    title = data.get('title')
    date = data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    price = data.get('price', '')
    url = data.get('url', '')
    
    if not all([title, date, start_time, end_time]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        current_user.schedule_event(title, date, start_time, end_time, price, url)
        return jsonify({"status": "success", "message": "Event scheduled successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/user-events")
@login_required
def get_user_events():
    try:
        events = current_user.get_events()
        print("User Events:")
        print(events)
        print(jsonify(events))
        return jsonify(events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/delete-event", methods=['POST'])
@login_required
def delete_user_event():
    data = request.get_json()
    title = data.get('title')
    
    if not title:
        return jsonify({"error": "Missing title"}), 400
    
    try:
        result = current_user.delete_event(title)
        return jsonify({"status": "success", "message": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def parse_events(lat, lng):
    generate_events(lat, lng)
    # sort_events(lat, lng)

if __name__ == "__main__":
    init_events()
    app.run(debug=True, ssl_context="adhoc")