import React from "react";

interface RideOffer {
  id: string;
  userId: string;
  userUsername: string;
  driverId: string;
  driverUsername: string;
  aproximatedTime: number;
  aproximatedCost: number;
  createdAt: Date;
  startingAddress: string;
  endingAddress: string;
  isDeleted: string;
  driveStatus: number;
}

interface RideOfferProps {
  rideOffer: RideOffer;
  onAccept: () => void;
  onDecline: () => void;
}

const RideOfferDisplay: React.FC<RideOfferProps> = ({
  rideOffer,
  onAccept,
  onDecline,
}) => {
  // Determine if the offer has been received based on the driver's username
  const isOfferReceived = rideOffer.driverUsername !== "";

  return (
    <div>
      <h2>Ride Offer Details</h2>
      <p>
        <strong>Starting Address:</strong> {rideOffer.startingAddress}
      </p>
      <p>
        <strong>Ending Address:</strong> {rideOffer.endingAddress}
      </p>
      <p>
        <strong>Driver:</strong> {rideOffer.driverUsername}
      </p>
      <p>
        <strong>Estimated Cost:</strong> {rideOffer.aproximatedCost.toFixed(2)}{" "}
        rsd
      </p>
      <p>
        <strong>Estimated Time:</strong> {rideOffer.aproximatedTime} minutes
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(rideOffer.createdAt).toLocaleString()}
      </p>
      {isOfferReceived && (
        <>
          <button onClick={onAccept}>Accept Offer</button>
          <button onClick={onDecline}>Decline Offer</button>
        </>
      )}
    </div>
  );
};

export default RideOfferDisplay;
