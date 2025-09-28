from flask_login import UserMixin

from .db import get_db, make_schedule, add_user, get_user

class User(UserMixin):
    def __init__(self, id_, name, email, profile_pic):
        self.id = str(id_)
        self.name = name
        self.email = email
        self.profile_pic = profile_pic



    @staticmethod
    def get(user_id):


        db = get_db()
        user = db.execute(
            "SELECT * FROM user WHERE id = ?", (user_id,)
        ).fetchone()
        if not user:
            return None

        user = User(
            id_=user[0], name=user[1], email=user[2], profile_pic=user[3]
        )
        return user

    def create(self):

        add_user(self.id, self.name, self.email, self.profile_pic)

        make_schedule(self.id)

    def schedule_event(self, title, date, start_time, end_time, price, url):
        events = self.get_events()
        if title in events:
            return "Event already scheduled"

        db = get_db()
        db.execute(
            f"INSERT INTO {self.id} (title, date, start_time, end_time, price, url) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (title, date, start_time, end_time, price, url),
        )
        db.commit()

        print(f"Event scheduled: {title} on {date} from {start_time} to {end_time} with price {price} and url {url}")

    def delete_event(self, title):
        events = self.get_events()
        event_titles = [event['title'] for event in events]
        if title not in event_titles:
            return "Event not scheduled"

        db = get_db()
        db.execute(
            f"DELETE FROM {self.id} WHERE title = ?",
            (title,)
        )
        db.commit()

        print(f"Event removed {title}")
        return "Event removed successfully"


    def get_events(self):
        events = []

        db = get_db()

        events_data = db.execute(f"SELECT * FROM {self.id}")
        for event in events_data.fetchall():
            events.append({
                'id': f"{self.id}-{event[0]}",  # Create unique ID
                'title': event[0],
                'date': event[1],
                'start_time': event[2],
                'end_time': event[3],
                'price': event[4],
                'url': event[5],
                'start': f"{event[1]}T{event[2]}:00",  # ISO format for frontend
                'end': f"{event[1]}T{event[3]}:00",    # ISO format for frontend
                'location': 'Philadelphia',  # Default location
                'notes': ''  # No notes field in current schema
            })

        return events