import React, { useState, useEffect } from "react";

interface CountdownDisplayProps {
  initialPhase: number; // 1: Waiting for Drive, 2: Drive in Progress
  waitingDuration: number; // Duration of waiting in seconds
  progressDuration: number; // Duration of driving in seconds
  onCountdownComplete: () => void;
  onDriveStart: () => void;
  onDriveEnd: () => void;
  setIsMenuDisabled: (value: boolean) => void;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  initialPhase,
  waitingDuration,
  progressDuration,
  onCountdownComplete,
  onDriveStart,
  onDriveEnd,
  setIsMenuDisabled,
}) => {
  const [phase, setPhase] = useState<number>(initialPhase);
  const [seconds, setSeconds] = useState<number>(
    initialPhase === 1 ? waitingDuration : progressDuration
  );
  const [countdownActive, setCountdownActive] = useState(false);

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
        onDriveStart(); // Call when drive starts
      } else if (phase === 2) {
        onDriveEnd(); // Call when drive ends
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
      setIsMenuDisabled(false); // Omogući meni kada se odbrojavanje završi
    } else {
      setIsMenuDisabled(countdownActive); // Onemogući meni dok je countdown aktivan
    }
  }, [countdownActive, seconds, phase, setIsMenuDisabled]);

  useEffect(() => {
    if (countdownActive) {
      setIsMenuDisabled(true);
    } else {
      setIsMenuDisabled(false);
    }
  }, [countdownActive]);

  const getDisplayText = () => {
    if (phase === 1) return "Waiting for Drive";
    if (phase === 2) return "Drive in Progress";
    return "";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        fontSize: "2rem",
      }}
    >
      <div>{`${getDisplayText()}: ${seconds}s`}</div>
    </div>
  );
};

export default CountdownDisplay;
