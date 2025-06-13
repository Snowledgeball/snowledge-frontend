import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Avatar,
    AvatarFallback,
    Card,
    Separator
} from '@repo/ui';
import React from 'react';
import { TimeframeBadge } from '../timeframe-badge';
import { PlatformAndScopeRow } from '../platform-and-scope-row';

// ============
// Function: TrendResultCardV2
// ------------
// DESCRIPTION: Display of Discord trend analysis (v2) using ShadCN components.
// PARAMS: result: object formatted per discord_trends_v2 schema
// RETURNS: JSX.Element
// ============
export function TrendResultCard({ result }: { result: any }) {
if (!result) return null

const activityColor = (level: string) => {
    switch (level) {
    case 'High': return 'bg-green-100 text-green-700'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-red-100 text-red-700'
    default: return 'bg-muted text-muted-foreground'
    }
}

const platform = result.platform || 'discord'
const scope = result.scope || 'all'

return (
    <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
    <div className="text-lg font-semibold flex items-center gap-2">Trend Analysis</div>
    {result.timeframe && <TimeframeBadge timeframe={result.timeframe} />}
    </div>

    <PlatformAndScopeRow platform={platform} scope={scope} label={platform.charAt(0).toUpperCase() + platform.slice(1)} />

    {/* Top 3 Influential Users Podium */}
    <div className="flex flex-col items-center my-4">
      <div className="text-base font-semibold mb-2">Top 3 Influential Users</div>
      <div className="flex justify-center items-end gap-6 w-full max-w-xs mx-auto">
        {/* Top 2 */}
        {result.notable_users?.[1] && (
          <div className="flex flex-col items-center">
            <div className="mb-1 text-xs font-medium text-muted-foreground">#2</div>
            <Avatar className="size-10">
              <AvatarFallback>{result.notable_users[1][0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1 text-foreground max-w-[64px] truncate" title={result.notable_users[1]}>{result.notable_users[1]}</span>
          </div>
        )}
        {/* Top 1 */}
        {result.notable_users?.[0] && (
          <div className="flex flex-col items-center">
            <div className="mb-1 text-xs font-bold text-yellow-600">#1</div>
            <Avatar className="size-14 ring-2 ring-yellow-400">
              <AvatarFallback>{result.notable_users[0][0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm mt-1 font-semibold text-foreground max-w-[80px] truncate" title={result.notable_users[0]}>{result.notable_users[0]}</span>
          </div>
        )}
        {/* Top 3 */}
        {result.notable_users?.[2] && (
          <div className="flex flex-col items-center">
            <div className="mb-1 text-xs font-medium text-muted-foreground">#3</div>
            <Avatar className="size-10">
              <AvatarFallback>{result.notable_users[2][0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1 text-foreground max-w-[64px] truncate" title={result.notable_users[2]}>{result.notable_users[2]}</span>
          </div>
        )}
      </div>
    </div>

    <Separator className="my-4" />

    <Accordion type="multiple" className="space-y-2">
    {Array.isArray(result.trends) && result.trends.length > 0 ? (
        result.trends.map((trend: any, index: number) => (
        <AccordionItem value={`trend-${index}`} key={index}>
            <AccordionTrigger className="py-3">
            <div className="flex w-full justify-between items-center">
                <span className="text-lg font-semibold">{trend.title}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${activityColor(trend.activity_level)}`}>{trend.activity_level}</span>
            </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{trend.summary}</div>
            <div>
                <div className="text-sm font-medium mt-2 mb-1">Representative Messages</div>
                <ul className="list-disc ml-5 text-sm space-y-1">
                {trend.representative_messages?.map((msg: string, idx: number) => (
                    <li key={idx}>{msg}</li>
                ))}
                </ul>
            </div>
            </AccordionContent>
        </AccordionItem>
        ))
    ) : (
        <div className="text-muted-foreground text-center text-sm py-4">
        No trends available.
        </div>
    )}
    </Accordion>
    </Card>
)
}

// ============
// FAKE DATA for preview/demo
// ============
export const FAKE_TREND_RESULT = {
timeframe: '2024-06-01 to 2024-06-07',
notable_users: ['Alice', 'Bob', 'Charlie', 'Diana'],
trends: [
    {
    title: 'Bot Downtime',
    summary: 'Users discussed the recent downtime of the moderation bot and its impact on server moderation. Suggestions for alternative tools were shared.',
    activity_level: 'High',
    representative_messages: [
        '[2024-06-02 14:12] Alice: The bot has been down for hours, any ETA?',
        '[2024-06-02 14:15] Bob: We really need moderation, spam is increasing.',
        '[2024-06-02 14:20] Diana: Maybe we should try another tool as backup.'
    ]
    },
    {
    title: 'New Voting Feature',
    summary: 'Excitement and questions about the new voting system. Some users asked for a tutorial, others debated its fairness.',
    activity_level: 'Medium',
    representative_messages: [
        '[2024-06-03 09:05] Charlie: The new voting system looks cool!',
        '[2024-06-03 09:10] Alice: Is there a guide for how it works?',
        '[2024-06-03 09:15] Bob: I hope it prevents vote spamming.'
    ]
    },
    {
    title: 'AMA with Founders',
    summary: 'Community members shared questions and excitement about the upcoming AMA session with the project founders.',
    activity_level: 'Low',
    representative_messages: [
        '[2024-06-04 18:00] Diana: What time is the AMA with the founders?',
        '[2024-06-04 18:05] Charlie: I have a question about the roadmap.'
    ]
    }
]
}