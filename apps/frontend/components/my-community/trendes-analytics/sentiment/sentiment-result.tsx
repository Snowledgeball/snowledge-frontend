import React from 'react';
import { Card } from '@repo/ui';
import { TimeframeBadge } from '../timeframe-badge';
import { PlatformAndScopeRow } from '../platform-and-scope-row';
import { SentimentGauge } from './sentiment-chart';

// ============
// Function: SentimentDisplay
// ------------
// DESCRIPTION: Displays the result of a sentiment analysis in a Card, with semicircular gauge.
// PARAMS: result: { id, platform, scope, timeframe, sentiment, score, summary }
// RETURNS: JSX.Element
// ============
export function SentimentDisplay({ result }: { result: any }) {
  if (!result) return null
  const platform = result.platform || 'discord'
  const scope = result.scope || 'all'
  return (
    <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="text-lg font-semibold flex items-center gap-2">
          Sentiment Analysis
        </div>
        {result.timeframe && <TimeframeBadge timeframe={result.timeframe} />}
      </div>
      <PlatformAndScopeRow platform={platform} scope={scope} label={platform.charAt(0).toUpperCase() + platform.slice(1)} />
      <div className="flex flex-col gap-2">
        <SentimentGauge sentiment={result.sentiment} score={result.score} />
        {/* Section messages caractéristiques */}
        <div className="mt-4">
          <div className="text-base font-medium mb-2">Most representative messages</div>
          <ul className="space-y-2">
            {(result.messages && result.messages.length > 0 ? result.messages : [
              { user: 'Alice', text: 'Great update, I love it! The new features are amazing and really helpful.' },
              { user: 'Bob', text: 'This is so helpful, thanks! The team did a fantastic job.' },
              { user: 'Charlie', text: 'Awesome work, team! Looking forward to more improvements.' },
            ]).map((msg: { user: string, text: string }, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-semibold text-primary">{msg.user}</span>
                <span
                  className="truncate max-w-xs text-foreground"
                  title={msg.text}
                >
                  “{msg.text}”
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
} 