import React from 'react'
import { 
    Card,
    Label,
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue,
    RadioGroup,
    RadioGroupItem,
    Badge, 
    PopoverContent,
    Popover,
    Calendar,
    Button,
    PopoverTrigger
} from '@repo/ui'; 
import { CalendarIcon, Loader2Icon } from 'lucide-react'
import { PlatformIconButtons } from '../platform-icon-buttons';
import { format } from 'date-fns';
import { cn } from '@workspace/ui/lib/utils';
import { AnalysisDescription } from '../analysis-description';
import { MultiSelect } from '@/components/shared/community/ui/MultiSelect';

// ============
// Function: TrendInputCard
// ------------
// DESCRIPTION: Card de configuration d'analyse de tendances multi-plateformes, réutilisable, avec tous les champs et contrôles nécessaires.
// PARAMS:
//   platforms: array des plateformes disponibles
//   selectedPlatform: string, plateforme sélectionnée
//   onSelectPlatform: (string) => void, handler sélection plateforme
//   scope: 'all' | 'custom', scope sélectionné
//   onScopeChange: (val: 'all' | 'custom') => void
//   discordChannels: array des channels Discord
//   selectedChannels: string[], channels sélectionnés
//   onChannelsChange: (string[]) => void
//   timeRange: string, time range sélectionné
//   onTimeRangeChange: (string) => void
//   customDate: Date | undefined, date custom
//   onCustomDateChange: (Date | undefined) => void
//   mode: 'standard' | 'reasoning', mode sélectionné
//   onModeChange: (val: 'standard' | 'reasoning') => void
//   messageCount: number, nombre de messages à analyser
//   canLaunch: boolean, bouton activable
//   loading: boolean, loading state
//   onStart: () => void, handler lancement analyse
//   PlatformIconButton: composant pour les icônes plateformes
// RETURNS: JSX.Element
// ============
export function TrendInputCard({
  platforms,
  selectedPlatform,
  onSelectPlatform,
  scope,
  onScopeChange,
  discordChannels,
  selectedChannels,
  onChannelsChange,
  timeRange,
  onTimeRangeChange,
  customDate,
  onCustomDateChange,
  mode,
  onModeChange,
  messageCount,
  canLaunch,
  loading,
  onStart,
  PlatformIconButton,
}: {
  platforms: any[],
  selectedPlatform: string,
  onSelectPlatform: (v: string) => void,
  scope: 'all' | 'custom',
  onScopeChange: (v: 'all' | 'custom') => void,
  discordChannels: {label: string, value: string}[],
  selectedChannels: Array<{label: string, value: string}>,
  onChannelsChange: (v: Array<{label: string, value: string}>) => void,
  timeRange: string,
  onTimeRangeChange: (v: string) => void,
  customDate: Date | undefined,
  onCustomDateChange: (v: Date | undefined) => void,
  mode: 'standard' | 'reasoning',
  onModeChange: (v: 'standard' | 'reasoning') => void,
  messageCount: number,
  canLaunch: boolean,
  loading: boolean,
  onStart: () => void,
  PlatformIconButton: React.FC<any>,
}) {
  // Fake videos for YouTube select
  const fakeYoutubeVideos = [
    { label: 'Intro to Voting', value: 'vid1' },
    { label: 'Community AMA', value: 'vid2' },
    { label: 'Feature Update', value: 'vid3' },
  ]
  const [selectedYoutubeVideos, setSelectedYoutubeVideos] = React.useState<Array<{label: string, value: string}>>([])

  return (
    <div className="bg-muted rounded-xl shadow p-6 flex flex-col gap-10">
      {/* 1. Platform selection with icons */}
      <PlatformIconButtons platforms={platforms} selectedPlatform={selectedPlatform} onSelectPlatform={onSelectPlatform} />
      {/* 2. Scope of analysis */}
      <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
        <Label className="block mb-3 text-base font-semibold">Scope of analysis</Label>
        {selectedPlatform === 'discord' && (
          <RadioGroup value={scope} onValueChange={(v: string) => onScopeChange(v as 'all' | 'custom')}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All channels (entire server)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Select specific channels</Label>
              </div>
              {scope === 'custom' && (
                <div className="mt-2">
                  <div className="w-64">
                    <MultiSelect
                      options={discordChannels}
                      value={selectedChannels}
                      onChange={onChannelsChange}
                      placeholder="Select channels..."
                    //   label={undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
        {selectedPlatform === 'youtube' && (
          <RadioGroup value={scope} onValueChange={(v: string) => onScopeChange(v as 'all' | 'custom')}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Full channel</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Select specific videos</Label>
              </div>
              {scope === 'custom' && (
                <div className="mt-2">
                  <div className="w-64">
                    <MultiSelect
                      options={fakeYoutubeVideos}
                      value={selectedYoutubeVideos}
                      onChange={setSelectedYoutubeVideos}
                      placeholder="Select videos..."
                    //   label={undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
        {selectedPlatform !== 'discord' && selectedPlatform !== 'youtube' && (
          <div className="text-muted-foreground text-sm">No scope options for this platform.</div>
        )}
        <div className="mt-4">
          {selectedPlatform === 'discord' ? (
            <Badge variant={messageCount > 0 ? 'default' : 'destructive'}>
              {messageCount > 0 ? `${messageCount.toLocaleString()} messages to be analyzed` : 'No messages to analyze'}
            </Badge>
          ) : selectedPlatform === 'youtube' ? (
            <Badge variant={messageCount > 0 ? 'default' : 'destructive'}>
              {messageCount > 0 ? `${messageCount.toLocaleString()} comments to be analyzed` : 'No comments to analyze'}
            </Badge>
          ) : null}
        </div>
      </Card>
      {/* 3. Time range */}
      <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
        <Label className="block mb-3 text-base font-semibold">Time range</Label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_day">Last day</SelectItem>
            <SelectItem value="last_week">Last week</SelectItem>
            <SelectItem value="last_month">Last month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {timeRange === 'custom' && (
          <div className="mt-2">
            {/* <DatePickerDemo date={customDate} setDate={onCustomDateChange} /> */}
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-64 justify-start text-left font-normal",
                    customDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={onCustomDateChange}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
          </div>
        )}
      </Card>
      {/* 4. Mode selection */}
      <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
        <Label className="block mb-3 text-base font-semibold">Mode</Label>
        <RadioGroup value={mode} onValueChange={(v: string) => onModeChange(v as 'standard' | 'reasoning')} className="flex flex-row gap-6">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard">Standard</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="reasoning" id="reasoning" />
            <Label htmlFor="reasoning">Reasoning</Label>
          </div>
        </RadioGroup>
      </Card>
      <AnalysisDescription type="trend" />
      {/* 6. Launch button */}
      <div className="pt-2">
        <Button
          className="w-full px-8"
          aria-label="Start analysis"
          size="lg"
          disabled={!canLaunch || loading}
          onClick={onStart}
        >
          {loading ? (
            <>
              <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
              Please wait
            </>
          ) : (
            'Start Analysis'
          )}
        </Button>
      </div>
    </div>
  )
} 