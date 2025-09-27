from flask_login import UserMixin

from db import get_db, make_schedule, add_user, get_user

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

    def get_events(self):
        event_names = []

        db = get_db()

        events = db.execute(f"SELECT * FROM {self.id}")
        for event in events.fetchall():
            event_names.append(event[0])

        return event_names