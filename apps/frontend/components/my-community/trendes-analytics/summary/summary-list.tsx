import React from 'react'
import { 
    Table, 
    TableHeader, 
    TableBody, 
    TableRow, 
    TableHead, 
    TableCell,
    Button
} from '@repo/ui'; 
import { SocialIcon } from 'react-social-icons'
import { TimeframeBadge } from '../timeframe-badge';

// ============
// Function: SummaryList
// ------------
// DESCRIPTION: Tableau historique des analyses de résumé. Props : history, onSelect
// PARAMS: history: array, onSelect: (result) => void
// RETURNS: JSX.Element
// ============
export function SummaryList({ history, onSelect }: { history: any[], onSelect: (result: any) => void }) {
  return (
    <>
      <div className="font-semibold text-base mb-4">Past Summary Analyses</div>
      <Table className="w-full text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="px-2 text-left w-[110px]">ID</TableHead>
            <TableHead className="px-2 text-left w-[160px]">Timeframe</TableHead>
            <TableHead className="px-2 text-center w-[56px]">Platform</TableHead>
            <TableHead className="px-2 text-center w-[60px]">Scope</TableHead>
            <TableHead className="px-2 text-center w-[60px]">Topics</TableHead>
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
              <TableCell className="px-2 text-center max-w-[60px] truncate">{item.scope === 'all' ? 'All' : 'Custom'}</TableCell>
              <TableCell className="px-2 text-center max-w-[60px] truncate">{item.topics?.length ?? 0}</TableCell>
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
export const FAKE_SUMMARY_HISTORY = [
  {
    id: 'SUM-001',
    timeframe: '2024-06-01 to 2024-06-07',
    platform: 'Discord',
    scope: 'all',
    topics: [
      { title: 'Bot Downtime' },
      { title: 'New Voting Feature' },
      { title: 'AMA with Founders' },
    ],
    date: '2024-06-07',
    notable_users: ['Alice', 'Bob', 'Charlie', 'Diana'],
    summary: "This week's discussion focused on the premium feature rollout and the moderation guideline updates. Users shared feedback, asked questions about the new features, and reported technical issues with the bot.",
    action_points: [
      "Clarify pricing and feature set for premium membership.",
      "Create a tutorial on how new moderation rules are applied.",
      "Investigate the cause of bot downtime and communicate resolution status."
    ]
  },
  {
    id: 'SUM-002',
    timeframe: '2024-05-20 to 2024-05-27',
    platform: 'YouTube',
    scope: 'custom',
    topics: [
      { title: 'Server Migration' },
      { title: 'New Roles' },
    ],
    date: '2024-05-27',
    notable_users: ['Eve', 'Frank'],
    summary: 'Migration completed, some confusion about new roles.'
  },
  {
    id: 'SUM-003',
    timeframe: '2024-05-10 to 2024-05-17',
    platform: 'X',
    scope: 'custom',
    topics: [
      { title: 'Community Guidelines' }],
    date: '2024-05-17',
    notable_users: ['Grace'],
    summary: 'Discussions about new guidelines, some concerns raised.'
  },
] 