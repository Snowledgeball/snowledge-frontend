import React, { useState } from "react";
import { Channel } from "../types";
import { Button } from "@repo/ui/components/button";
import { PencilIcon, XIcon, CheckIcon } from "lucide-react";

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
  onRename?: (oldName: string, newName: string) => void;
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
  onRename,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(value);

  const handleRename = () => {
    if (onRename && value && renameValue && value !== renameValue) {
      onRename(value, renameValue);
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex gap-2 items-center">
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
          disabled={loading || isRenaming}
        >
          {channels.map((ch) => (
            <option key={ch.id} value={ch.name}>
              {ch.name}
            </option>
          ))}
          <option value="__new__">Créer un nouveau salon...</option>
        </select>
        {mode === "select" && value && !isRenaming && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-1"
            onClick={() => {
              setIsRenaming(true);
              setRenameValue(value);
            }}
            disabled={loading}
            aria-label="Renommer le salon"
          >
            <PencilIcon className="h-4 w-4 text-blue-600" />
          </Button>
        )}
        {isRenaming && (
          <div className="flex gap-1 items-center ml-2">
            <input
              className="border rounded px-2 py-1"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleRename}
              disabled={loading || !renameValue || renameValue === value}
              aria-label="Valider le renommage"
            >
              <CheckIcon className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setIsRenaming(false)}
              aria-label="Annuler le renommage"
            >
              <XIcon className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        )}
      </div>
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
};
