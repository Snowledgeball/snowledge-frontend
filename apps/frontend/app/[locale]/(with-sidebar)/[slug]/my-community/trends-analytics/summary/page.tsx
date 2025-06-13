"use client";
import { PlatformIconButton } from '@/components/my-community/trendes-analytics/platform-icon-buttons';
import { SummaryInput } from '@/components/my-community/trendes-analytics/summary/summary-input';
import { FAKE_SUMMARY_HISTORY, SummaryList } from '@/components/my-community/trendes-analytics/summary/summary-list';
import SummaryResult from '@/components/my-community/trendes-analytics/summary/summary-result';
import { Card } from '@repo/ui';
import React, { useState } from 'react'
export default function Page() {
   const [selectedResult, setSelectedResult] = useState<any>(FAKE_SUMMARY_HISTORY[0])
  // Demo props (adapter selon besoin réel)
  const platforms = [
    { key: 'discord', name: 'Discord', color: '#5865F2' },
    // { key: 'youtube', name: 'YouTube', color: '#FF0000' },
    // { key: 'x', name: 'X', color: '#000000' },
  ]
  const [selectedPlatform, setSelectedPlatform] = useState('discord')
  const [scope, setScope] = useState<'all' | 'custom'>('all')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState('last_week')
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)
  const [mode, setMode] = useState<'standard' | 'reasoning'>('standard')
  const [loading, setLoading] = useState(false)
  const messageCount = 1200
  const canLaunch = true

  return (
    <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
      {/* Panneau gauche (formulaire) */}
      <aside className="relative flex flex-col items-stretch h-full min-h-0">
        <SummaryInput
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          scope={scope}
          onScopeChange={setScope}
          discordChannels={[]}
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
          onStart={() => {}}
          PlatformIconButton={PlatformIconButton}
        />
      </aside>
      {/* Panneau droit (résultat + historique) */}
      <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
        <SummaryResult 
          summary={selectedResult.summary}
          action_points={selectedResult.action_points || []}
          timeframe={selectedResult.timeframe || selectedResult.date}
          activityLevel={selectedResult.activityLevel || 'Medium'}
        />
        <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
          <SummaryList history={FAKE_SUMMARY_HISTORY} onSelect={setSelectedResult} />
        </Card>
      </section>
    </main>
  )
}
