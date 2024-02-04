import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const messageListRef = useRef(null);

  useEffect(() => {
    const newSocket = io({ autoConnect: false });
    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Error handling
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Automatic scrolling to the bottom of the message list
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }

      // Event listener for chat messages
      socket.on('chat', (data) => {
        setChatMessages([...chatMessages, `${data.username}: ${data.message}`]);
      });

      // Event listener for user disconnect
      socket.on('user_leave', (username) => {
        setChatMessages([...chatMessages, `${username} left the chat`]);
      });
    }
  }, [socket, chatMessages]);

  const handleJoin = () => {
    socket.connect();

    socket.on('connect', () => {
      socket.emit('user_join', username);
      setIsJoined(true);
      setUsername(''); // Clear the username input
    });
  };

  const handleSendMessage = (event) => {
    if (event.key === 'Enter') {
      socket.emit('new_message', message);
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      {isJoined ? (
        <div style={styles.chatContainer}>
          <ul ref={messageListRef} style={styles.messageList}>
            {chatMessages.map((msg, index) => (
              <li key={index} style={styles.messageItem}>
                {msg}
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleSendMessage}
            placeholder="Enter a Message"
            style={styles.input}
          />
        </div>
      ) : (
        <div style={styles.joinContainer}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={styles.input}
          />
          <button onClick={handleJoin} style={styles.joinButton}>
            JOIN
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#e5e5e5',
  },
  chatContainer: {
    width: '50%',
  },
  messageList: {
    height: '300px',
    backgroundColor: 'white',
    overflowY: 'scroll',
    padding: '10px',
    borderRadius: '5px',
  },
  messageItem: {
    listStyle: 'none',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
  },
  joinContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '10px',
  },
  joinButton: {
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  },
};

export default App;
