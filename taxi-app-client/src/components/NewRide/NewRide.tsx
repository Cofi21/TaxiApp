import React from "react";
import CreateRide from "../CreateRide/CreateRide";

interface NewRideProps {
  userUsername: string;
  setIsMenuDisabled: (value: boolean) => void;
}

const NewRide: React.FC<NewRideProps> = ({
  userUsername,
  setIsMenuDisabled,
}) => {
  return (
    <div>
      <CreateRide
        userUsername={userUsername}
        setIsMenuDisabled={setIsMenuDisabled}
      />
    </div>
  );
};

export default NewRide;
