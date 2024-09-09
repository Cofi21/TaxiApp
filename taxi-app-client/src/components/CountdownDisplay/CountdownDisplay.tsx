import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

interface CountdownDisplayProps {
  initialPhase: number; // 1: Waiting for Drive, 2: Drive in Progress
  waitingDuration: number; // Duration of waiting in seconds
  progressDuration: number; // Duration of driving in seconds
  onCountdownComplete: () => void;
  onDriveStart: () => void;
  onDriveEnd: () => void;
  setIsMenuDisabled: (value: boolean) => void;
  username: string; // Pass logged-in username to identify the sender
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  initialPhase,
  waitingDuration,
  progressDuration,
  onCountdownComplete,
  onDriveStart,
  onDriveEnd,
  setIsMenuDisabled,
  username,
}) => {
  const [phase, setPhase] = useState<number>(initialPhase);
  const [seconds, setSeconds] = useState<number>(
    initialPhase === 1 ? waitingDuration : progressDuration
  );
  const [countdownActive, setCountdownActive] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (seconds > 0) {
      setCountdownActive(true);
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      if (phase === 1) {
        setPhase(2);
        setSeconds(progressDuration);
        onDriveStart();
      } else if (phase === 2) {
        onDriveEnd();
        onCountdownComplete();
        setCountdownActive(false);
      }
    }
  }, [
    seconds,
    phase,
    progressDuration,
    onCountdownComplete,
    onDriveStart,
    onDriveEnd,
  ]);

  useEffect(() => {
    if (seconds === 0 && phase === 2) {
      setIsMenuDisabled(false);
    } else {
      setIsMenuDisabled(countdownActive);
    }
  }, [countdownActive, seconds, phase, setIsMenuDisabled]);

  useEffect(() => {
    if (countdownActive) {
      setIsMenuDisabled(true);
    } else {
      setIsMenuDisabled(false);
    }
  }, [countdownActive]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_REACT_APP_BACKEND_URL_CHAT_API}`) // URL to your SignalR hub    IZMENI OVO================================================
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR Hub");

          connection.on(
            "ReceiveMessage",
            (user: string, receivedMessage: string) => {
              setMessages((prevMessages) => [
                ...prevMessages,
                `${user}: ${receivedMessage}`,
              ]);
            }
          );
        })
        .catch((error) => console.error("Connection failed: ", error));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection && message) {
      await connection.invoke("SendMessage", username, message);
      setMessage("");
    }
  };

  const getDisplayText = () => {
    if (phase === 1) return "Waiting for Drive";
    if (phase === 2) return "Drive in Progress";
    return "";
  };

  return (
    <div
      className="overlay-div"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div>
        <h1>{`${getDisplayText()}: ${seconds}s`}</h1>
      </div>
      <div className="chat-container">
        <div className="message-box">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              {msg}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="message-input"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountdownDisplay;
