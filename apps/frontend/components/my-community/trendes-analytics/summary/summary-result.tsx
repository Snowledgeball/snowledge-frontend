import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'; 
import { CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback } from '@repo/ui'; 
import { FAKE_SUMMARY_HISTORY } from './summary-list';
import { TimeframeBadge } from '../timeframe-badge';
import { PlatformAndScopeRow } from '../platform-and-scope-row';

type DiscordSummary = {
summary: string
action_points: string[]
timeframe?: string
activityLevel?: "Low" | "Medium" | "High"
notable_users?: string[]
}

const activityColorMap = {
Low: "text-yellow-600",
Medium: "text-orange-500",
High: "text-green-600",
}

export default function DiscordSummaryCard({
summary,
action_points,
timeframe,
activityLevel = "Medium",
notable_users,
platform = 'discord',
scope = 'all',
}: DiscordSummary & { platform?: string, scope?: string }) {
  // Use FAKE_SUMMARY_HISTORY[0] as fallback if no prop provided
  const fallback = FAKE_SUMMARY_HISTORY[0]
  const displaySummary = summary || fallback.summary
  const displayActionPoints = (action_points && action_points.length > 0) ? action_points : (fallback.action_points || [])
  const displayNotableUsers = (notable_users && notable_users.length > 0) ? notable_users : (fallback.notable_users || [])
  return (
    <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6">
    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold">
        Summary Analysis
      </CardTitle>
      {timeframe && <TimeframeBadge timeframe={timeframe === '2024-06-01 to 2024-06-07' ? 'last week' : timeframe} />}
    </CardHeader>
    <PlatformAndScopeRow platform={platform} scope={scope} label={platform.charAt(0).toUpperCase() + platform.slice(1)} />

    <CardContent className="space-y-8">
        <div>
          <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">Summary</h3>
          <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">{displaySummary}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">Action Points</h3>
          <ul className="list-disc list-inside space-y-3">
            {displayActionPoints.map((point, idx) => (
              <li key={idx} className="text-base md:text-lg flex items-start gap-3 font-medium">
                <CheckCircle2 size={20} className="text-primary mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        {displayNotableUsers && displayNotableUsers.length > 0 && (
          <div className="mt-10">
            <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">Notable Users</h3>
            <div className="flex flex-wrap justify-start gap-x-8 gap-y-6 mb-2">
              {displayNotableUsers.map((user, idx) => (
                <div key={idx} className="flex flex-col items-center" title={user} tabIndex={0} aria-label={user}>
                  <Avatar className="size-12">
                    <AvatarFallback>{user[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs mt-2 text-foreground max-w-[80px] truncate" title={user}>{user}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </CardContent>
    </Card>
  )
}