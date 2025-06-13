import { Badge } from '@repo/ui';
import React from 'react';
import { SocialIcon } from 'react-social-icons';

// ============
// Function: PlatformAndScopeRow
// ------------
// DESCRIPTION: Displays a row with the platform SocialIcon and the scope badge, harmonized and accessible.
// PARAMS:
//   - platform: string (platform key, e.g. 'discord')
//   - scope: string (scope label)
//   - label?: string (platform name, for accessibility)
// RETURNS: JSX.Element
// ============
export interface PlatformAndScopeRowProps {
  platform: string
  scope: string
  label?: string
}

export function PlatformAndScopeRow({ platform, scope, label }: PlatformAndScopeRowProps) {
  return (
    <div className="flex items-center gap-4 mt-1 mb-2">
      <span
        title={label || platform}
        aria-label={label || platform}
        tabIndex={0}
        className="flex justify-center items-center"
      >
        <SocialIcon
          network={platform.toLowerCase()}
          style={{ height: 24, width: 24 }}
        />
      </span>
      <span className="text-sm text-muted-foreground">Platform: <span className="font-medium text-foreground">{label || platform}</span></span>
      <Badge variant="secondary" className="ml-2 text-xs">Scope: {scope}</Badge>
    </div>
  )
} 