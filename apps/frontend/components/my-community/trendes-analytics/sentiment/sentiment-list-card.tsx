import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, Badge } from '@repo/ui'; 
import { SocialIcon } from 'react-social-icons';
import { TimeframeBadge } from '../timeframe-badge';

// ============
// Function: SentimentListCard
// ------------
// DESCRIPTION: Displays a table of past sentiment analyses. Clicking view shows the result in SentimentDisplay.
// PARAMS: history: array of sentiment analysis results, onSelect: (result) => void
// RETURNS: JSX.Element
// ============
export function SentimentListCard({ history, onSelect }: { history: any[], onSelect: (result: any) => void }) {
  // Palette harmonisée avec sentiment-chart.tsx
  const SENTIMENT_COLORS: Record<'positive' | 'neutral' | 'negative', string> = {
    positive: '#16a34a', // green
    neutral: '#facc15',  // yellow
    negative: '#dc2626', // red
  }

  return (
    <>
      <div className="font-semibold text-base mb-4">Past Sentiment Analyses</div>
      <Table className="w-full text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="px-2 text-left w-[110px]">ID</TableHead>
            <TableHead className="px-2 text-left w-[160px]">Timeframe</TableHead>
            <TableHead className="px-2 text-center w-[56px]">Platform</TableHead>
            <TableHead className="px-2 text-center w-[60px]">Scope</TableHead>
            <TableHead className="px-2 text-center w-[70px]">Sentiment</TableHead>
            <TableHead className="px-2 text-center w-[90px]">Date</TableHead>
            <TableHead className="px-2 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item, idx) => (
            <TableRow key={item.id || idx}>
              <TableCell className="px-2 text-left font-medium max-w-[110px] whitespace-nowrap">
                <Button variant="link" className="p-0 h-auto min-w-0" onClick={() => onSelect(item)}>{item.id}</Button>
              </TableCell>
              <TableCell className="px-2 text-left max-w-[160px] whitespace-nowrap">
                <TimeframeBadge timeframe={item.timeframe} />
              </TableCell>
              <TableCell className="px-2 text-center">
                <span title={item.platform} aria-label={item.platform} tabIndex={0} className="flex justify-center items-center">
                  <SocialIcon network={item.platform.toLowerCase()} style={{ height: 24, width: 24 }} />
                </span>
              </TableCell>
              <TableCell className="px-2 text-center max-w-[60px] truncate">{item.scope}</TableCell>
              <TableCell className="px-2 text-center max-w-[70px] truncate">
                <Badge style={{ backgroundColor: SENTIMENT_COLORS[item.sentiment as 'positive' | 'neutral' | 'negative'], color: item.sentiment === 'neutral' ? '#222' : '#fff' }}>
                  {item.sentiment}
                </Badge>
              </TableCell>
              <TableCell className="px-2 text-center max-w-[90px] whitespace-nowrap">{item.date}</TableCell>
              <TableCell className="px-2 text-center">
                <Button size="sm" variant="outline" onClick={() => onSelect(item)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

// ============
// FAKE DATA for demo
// ============
export const FAKE_SENTIMENT_HISTORY = [
  {
    id: 'SEN-001',
    timeframe: '2024-06-01 to 2024-06-07',
    platform: 'Discord',
    scope: 'All',
    sentiment: 'positive',
    date: '2024-06-07',
    dataCount: 1200,
    score: 87,
    summary: 'Majority of messages were positive, with excitement about new features.'
  },
  {
    id: 'SEN-002',
    timeframe: '2024-05-20 to 2024-05-27',
    platform: 'YouTube',
    scope: 'Custom',
    sentiment: 'neutral',
    date: '2024-05-27',
    dataCount: 800,
    score: 65,
    summary: 'Mixed feedback on the latest video, some requests for clarification.'
  },
  {
    id: 'SEN-003',
    timeframe: '2024-05-10 to 2024-05-17',
    platform: 'X',
    scope: 'All',
    sentiment: 'negative',
    date: '2024-05-17',
    dataCount: 950,
    score: 42,
    summary: 'Concerns about moderation and spam, negative sentiment increased.'
  },
] 