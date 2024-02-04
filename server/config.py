from flask import Flask, render_template, request, jsonify,make_response
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import current_user, login_required

app = Flask(__name__)

db = SQLAlchemy()


app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///forums.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE']='sqlalchemy'
app.config['SESSION_SQLALCHEMY']=db
app.config['DEBUG'] = True


migrate = Migrate(app, db)

CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO()


db.init_app(app)
socketio.init_app(app)