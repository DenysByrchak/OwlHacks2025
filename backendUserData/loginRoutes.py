import json
import os
import sqlite3
import sys

from flask import redirect, request, url_for
from flask_login import (
    LoginManager,
    login_required,
    login_user,
    logout_user,
)
from oauthlib.oauth2 import WebApplicationClient
import requests


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DISCOVERY_URL

# Internal imports
from .db import init_db_command, get_user
from .user import User




# app = Flask(__name__)
# app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)





def connect_login_routes(app):

    client = WebApplicationClient(GOOGLE_CLIENT_ID)

    login_manager = LoginManager()
    login_manager.init_app(app)

    try:
        init_db_command()
    except sqlite3.OperationalError:
        pass


    @login_manager.user_loader
    def load_user(user_id):
        return User.get(user_id)


    @app.route("/login")
    def login():


        google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        request_uri = client.prepare_request_uri(
            authorization_endpoint,
            redirect_uri=request.url_root + "login/callback",
            scope=["openid", "email", "profile"],
        )
        return redirect(request_uri)

    @app.route("/login/callback")
    def callback():

        code = request.args.get("code")

        google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        token_endpoint = google_provider_cfg["token_endpoint"]

        token_url, headers, body = client.prepare_token_request(
            token_endpoint,
            authorization_response=request.url,
            redirect_url=request.base_url,
            code=code
        )
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
        )


        client.parse_request_body_response(json.dumps(token_response.json()))

        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)

        if userinfo_response.json().get("email_verified"):
            unique_id = 'u'+str(userinfo_response.json()["sub"])
            users_email = userinfo_response.json()["email"]
            picture = userinfo_response.json()["picture"]
            users_name = userinfo_response.json()["given_name"]
        else:
            return "User email not available or not verified by Google.", 400


        user = User(
            id_=unique_id, name=users_name, email=users_email, profile_pic=picture
        )

        if not get_user(user.id):
            user.create()

        login_user(user)

        return redirect(url_for("serve_landing"))

    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        return redirect(url_for("serve_landing"))

