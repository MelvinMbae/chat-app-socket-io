import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

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
    if (isJoined && socket) {
      // Listen for new messages from the server
      socket.on('new_message', (newMessage) => {
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }
  }, [isJoined, socket]);

  const handleJoin = () => {
    socket.connect();

    socket.on('connect', () => {
      socket.emit('user_join', username);
      setIsJoined(true);
    });
  };

  const handleSendMessage = (event) => {
    if (event.key === 'Enter') {
      // Emit message through socket
      socket.emit('new_message', { username, message });

      // Save message to Flask server
      fetch('http://localhost:5001/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, content: message }),
      });

      setMessage('');
    }
  };

  useEffect(() => {
    if (isJoined && socket) {
      // Fetch messages for the user from Flask server
      const fetchMessages = async () => {
        try {
          const response = await fetch('http://localhost:5001/user_join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });

          const data = await response.json();
          setChatMessages(data.messages);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchMessages();
    }
  }, [isJoined, socket, username]);

  return (
    <div style={styles.container}>
      {isJoined ? (
        <div style={styles.chatContainer}>
          <ul style={styles.messageList}>
            {chatMessages.map((msg, index) => (
              <li key={index} style={styles.messageItem}>
                <strong>{msg.username}:</strong> {msg.content} ({msg.timestamp})
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
