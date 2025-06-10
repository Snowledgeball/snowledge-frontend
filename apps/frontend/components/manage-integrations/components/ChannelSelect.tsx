import React from "react";
import { Channel } from "../types";

interface ChannelSelectProps {
  label: string;
  mode: "select" | "new";
  value: string;
  onModeChange: (mode: "select" | "new") => void;
  onValueChange: (value: string) => void;
  channels: Channel[];
  newValue: string;
  setNewValue: (v: string) => void;
  loading: boolean;
}

export const ChannelSelect: React.FC<ChannelSelectProps> = ({
  label,
  mode,
  value,
  onModeChange,
  onValueChange,
  channels,
  newValue,
  setNewValue,
  loading,
}) => (
  <div>
    <label className="block font-medium">{label}</label>
    <select
      className="border rounded px-2 py-1 w-full"
      value={mode === "new" ? "__new__" : value}
      onChange={(e) => {
        if (e.target.value === "__new__") onModeChange("new");
        else {
          onValueChange(e.target.value);
          onModeChange("select");
        }
      }}
      disabled={loading}
    >
      {channels.map((ch) => (
        <option key={ch.id} value={ch.name}>
          {ch.name}
        </option>
      ))}
      <option value="__new__">Créer un nouveau salon...</option>
    </select>
    {mode === "new" && (
      <input
        className="border rounded px-2 py-1 w-full mt-2"
        placeholder="Nom du nouveau salon"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        disabled={loading}
      />
    )}
  </div>
);
