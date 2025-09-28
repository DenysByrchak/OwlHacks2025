import sqlite3

import click
from flask import current_app, g
from flask.cli import with_appcontext

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            "backendUserData/userInfo.db", detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop("db", None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()

    with current_app.open_resource("backendUserData/schema.sql") as f:
        db.executescript(f.read().decode("utf8"))

def make_schedule(user_id):
    db = get_db()

    db.execute(
        f'''
            CREATE TABLE IF NOT EXISTS {user_id} (
                title TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                price TEXT,
                url TEXT NOT NULL
            );
        ''')

    db.commit()

def add_user(id_, name, email, profile_pic):
    db = get_db()
    db.execute(
        "INSERT INTO user (id, name, email, profile_pic) "
        "VALUES (?, ?, ?, ?)",
        (id_, name, email, profile_pic),
    )
    db.commit()


def get_user(id_):

    db = get_db()
    user = db.execute(
        "SELECT * FROM user WHERE id = ?", (id_,)
    ).fetchone()
    if not user:
        return None

    return user
@click.command("init-db")
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo("Initialized the database.")

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

