"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

import { SentimentInput } from "@/components/my-community/trendes-analytics/sentiment/sentiment-input";
import { Card } from "@repo/ui";
import { SentimentDisplay } from "@/components/my-community/trendes-analytics/sentiment/sentiment-result";
import { FAKE_SENTIMENT_HISTORY, SentimentListCard } from "@/components/my-community/trendes-analytics/sentiment/sentiment-list-card";
import { PlatformIconButton } from "@/components/my-community/trendes-analytics/platform-icon-buttons";
export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.trendsAnalytics) {
    notFound();
  }
  const [selectedResult, setSelectedResult] = useState<any>(FAKE_SENTIMENT_HISTORY[0])

  // Réutilisation des props pour la démo
  const platforms = [
    { key: 'discord', name: 'Discord', color: '#5865F2' },
    // { key: 'youtube', name: 'YouTube', color: '#FF0000' },
    // { key: 'x', name: 'X', color: '#000000' },
  ]
  const [selectedPlatform, setSelectedPlatform] = useState('discord')
  const [scope, setScope] = useState<'all' | 'custom'>('all')
  const [selectedChannels, setSelectedChannels] = useState<Array<{label: string, value: string}>>([])
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
        <SentimentInput
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
          // PlatformIconButton={PlatformIconButton} // ERREUR: pas dans les parametre enfant ! A VOIR
        />
      </aside>
      {/* Panneau droit (résultat + historique) */}
      <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
        <SentimentDisplay result={selectedResult} />
        <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
          <SentimentListCard history={FAKE_SENTIMENT_HISTORY} onSelect={setSelectedResult} />
        </Card>
      </section>
    </main>
  )
}
