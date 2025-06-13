"use client";
import { TrendInputCard } from "@/components/my-community/trendes-analytics/trend/trend-input";
import { FAKE_TREND_RESULT, TrendResultCard } from "@/components/my-community/trendes-analytics/trend/trend-result";
import { Card } from "@repo/ui";
import { FAKE_TREND_HISTORY, TrendListCard } from "@/components/my-community/trendes-analytics/trend/trend-list";
import { PlatformIconButton } from "@/components/my-community/trendes-analytics/platform-icon-buttons";
import { useState } from "react";
const platforms = [
  {
    key: 'discord',
    name: 'Discord',
    url: 'https://discord.com',
    color: '#5865F2',
    options: [
      { label: '#general', value: 'general' },
      { label: '#announcements', value: 'announcements' },
      { label: '#random', value: 'random' },
      { label: '#support', value: 'support' },
    ],
    type: 'channels',
  },
//   {
//     key: 'youtube',
//     name: 'YouTube',
//     url: 'https://youtube.com',
//     color: '#FF0000',
//     options: [
//       { label: 'Intro to Voting', value: 'vid1' },
//       { label: 'Community AMA', value: 'vid2' },
//       { label: 'Feature Update', value: 'vid3' },
//     ],
//     type: 'videos',
//   },
//   {
//     key: 'x',
//     name: 'X',
//     url: 'https://x.com',
//     color: '#000000',
//     options: [
//       { label: 'Post 1', value: 'post1' },
//       { label: 'Post 2', value: 'post2' },
//       { label: 'Post 3', value: 'post3' },
//     ],
//     type: 'posts',
//   },
]
export default function Page() {
 const [selectedPlatform, setSelectedPlatform] = useState('discord')
  const [scope, setScope] = useState<'all' | 'custom'>('all')
  const [selectedChannels, setSelectedChannels] = useState<Array<{label: string, value: string}>>([])
  const [timeRange, setTimeRange] = useState('last_week')
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)
  const [mode, setMode] = useState<'standard' | 'reasoning'>('standard')
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedResult, setSelectedResult] = useState<any>(FAKE_TREND_RESULT)

  // Mock data for channels and message count
  const discordChannels = [
    { label: '#general', value: 'general' },
    { label: '#announcements', value: 'announcements' },
    { label: '#random', value: 'random' },
    { label: '#support', value: 'support' },
  ]
  const messageCount = scope === 'all' ? 3278 : selectedChannels.length * 800
  const canLaunch = messageCount > 0 && (scope === 'all' || selectedChannels.length > 0)

  // Mock result for demo
  const mockResult = {
    sentiment: 'positive',
    confidence: 87,
    topics: [
      { title: 'Voting System', summary: 'Most users discussed the new voting system and its impact on community decisions.' },
      { title: 'Bot Issues', summary: 'Several users reported issues with the moderation bot not responding.' },
      { title: 'Upcoming AMA', summary: 'Excitement about the upcoming AMA with the founders.' },
    ],
    raw: '{ "sentiment": "positive", "topics": [ ... ] }',
  }

  function handleStart() {
    setLoading(true)
    setTimeout(() => {
      setResult(mockResult)
      setLoading(false)
    }, 1800)
  }

  return (
    <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
      {/* Panneau gauche (formulaire) */}
      <aside className="relative flex flex-col items-stretch h-full min-h-0">
        <TrendInputCard
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          scope={scope}
          onScopeChange={setScope}
          discordChannels={discordChannels}
          selectedChannels={selectedChannels}
          onChannelsChange={setSelectedChannels}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
          mode={mode}
          onModeChange={setMode}
          messageCount={messageCount}
          canLaunch={canLaunch}
          loading={loading}
          onStart={handleStart}
          PlatformIconButton={PlatformIconButton}
        />
      </aside>
      {/* Panneau droit (résultat + historique) */}
      <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
        <TrendResultCard result={selectedResult} />
        <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
          <TrendListCard history={FAKE_TREND_HISTORY} onSelect={setSelectedResult} />
        </Card>
      </section>
    </main>
  )
}
