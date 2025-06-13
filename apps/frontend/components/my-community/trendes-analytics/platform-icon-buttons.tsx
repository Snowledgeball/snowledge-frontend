import React from 'react';
import { SocialIcon } from 'react-social-icons';

// ============
// Function: PlatformIconButton
// ------------
// DESCRIPTION: Affiche une SocialIcon clickable, sans border, sans fond, sans border-radius, pour harmonisation parfaite avec DataCollectionSetup. Utilise network au lieu de url. Ajoute un effet visuel de sélection (ombre ou contour).
// PARAMS: network: string, color: string, selected: boolean, onClick: () => void, label: string
// RETURNS: JSX.Element
// ============
export function PlatformIconButton({ network, color, selected, onClick, label }: { network: string, color: string, selected: boolean, onClick: () => void, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`focus:outline-none bg-transparent p-0 m-0 border-none flex flex-col items-center transition-all ${selected ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : ''}`}
      style={{ boxShadow: 'none', border: 'none', background: 'none', outline: 'none' }}
    >
      <SocialIcon
        network={network}
        bgColor={color}
        style={{ height: 40, width: 40, filter: selected ? 'none' : 'grayscale(1) opacity(0.5)' }}
      />
      <span className={`text-xs mt-1 ${selected ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </button>
  )
}

// ============
// Function: PlatformIconButtons
// ------------
// DESCRIPTION: Affiche une rangée d'icônes sociales pour la sélection de plateforme, harmonisée et accessible.
// PARAMS:
//   platforms: array { key, name, color }
//   selectedPlatform: string
//   onSelectPlatform: (string) => void
// RETURNS: JSX.Element
// ============
export function PlatformIconButtons({ platforms, selectedPlatform, onSelectPlatform }: { platforms: { key: string, name: string, color: string }[], selectedPlatform: string, onSelectPlatform: (key: string) => void }) {
  return (
    <div className="flex justify-center gap-8 my-4">
      {platforms.map(p => (
        <PlatformIconButton
          key={p.key}
          network={p.key}
          color={p.color}
          selected={selectedPlatform === p.key}
          onClick={() => onSelectPlatform(p.key)}
          label={p.name}
        />
      ))}
    </div>
  )
} 