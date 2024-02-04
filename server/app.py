from config import app, socketio, jsonify, request, db, emit, make_response
from models import User, Message


@app.route("/")
def index():
    return jsonify({"home": "This is the index page"})


users = {}


@socketio.on("connect")
def handle_connect():
    print("Client connected!")


@socketio.on("user_join")
def handle_user_join(username):
    print(f"User {username} joined!")
    users[username] = request.sid


@socketio.on("new_message")
def handle_new_message(message):
    print(f"New message: {message}")
    username = None
    for user in users:
        if users[user] == request.sid:
            username = user
    emit("chat", {"message": message, "username": username}, broadcast=True)


@app.route('/user_join', methods=['POST', 'GET'])
def user_join():

    data = request.get_json()
    username = data.get('username')

    user = User.query.filter_by(username=username).first()
    if not user:
        new_user = User(username=username)
        db.session.add(new_user)
        db.session.commit()

    messages = Message.query.join(User).filter(User.username == username).all()
    message_list = [{'username': msg.user.username, 'content': msg.content,
                     'timestamp': msg.timestamp} for msg in messages]

    return jsonify({'message': 'User joined successfully', 'messages': message_list})


@app.route('/messages', methods=['POST', 'GET'])
def messages():
    if request.method == 'GET':
        messages = [message.to_dict() for message in Message.query.all()]

        response = make_response(
            jsonify(messages),
            200
        )

        return response

    elif request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        content = data.get('content')

        user = User.query.filter_by(username=username).first()
        if user:
            new_message = Message(user_id=user.id, content=content)
            db.session.add(new_message)
            db.session.commit()

            return jsonify({'message': 'Message sent successfully'})
        else:
            return jsonify({'message': 'User not found'}), 404


@app.route('/get_messages/<username>', methods=['GET'])
def get_messages(username):
    user = User.query.filter_by(username=username).first()
    if user:
        messages = Message.query.filter_by(user_id=user.id).all()
        message_list = [{'content': msg.content,
                         'timestamp': msg.timestamp} for msg in messages]
        return jsonify(message_list)
    else:
        return jsonify({'message': 'User not found'}), 404


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001)


# if __name__ == '__main__':
#     socketio.run(app, debug=True, port=5001)
