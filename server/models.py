from config import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
import re
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer , primary_key = True)
    username = db.Column(db.String(80), nullable=False)
    
    messages=db.relationship("Message", backref='user')
    
    
    
class Message(db.Model):
    __tablename__='messages'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    