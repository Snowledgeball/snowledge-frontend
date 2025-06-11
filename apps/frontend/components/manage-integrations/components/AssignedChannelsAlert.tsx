import React from "react";
import { AlertInfo } from "./AlertInfo";

export const AssignedChannelsAlert: React.FC = () => (
  <AlertInfo
    title="Salons Discord assignés"
    description="Vous pouvez renommer chaque salon si besoin."
    className="mb-4"
  />
);

export default AssignedChannelsAlert;
