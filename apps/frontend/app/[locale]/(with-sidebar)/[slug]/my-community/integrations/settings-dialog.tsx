import React, { useState } from 'react'
import { CheckCircle2, LogIn, LogOut, Cog } from 'lucide-react'
import { SocialIcon } from 'react-social-icons'
import { Button, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@repo/ui/components/dialog";
import { useRouter } from 'next/navigation';
// ============
// Type definitions
// ============
interface PlatformProps {
  key: string
  name: string
  url: string
  urlAuth: string
  color: string
  type: string
  options: { label: string, value: string }[]
}

interface AccountMock {
  id: string
  name: string
  connected: boolean
}

interface EntityMock {
  id: string
  name: string
  selected: boolean
}

// ============
// Mock data
// ============
const mockAccounts: Record<string, AccountMock> = {
  discord: {
    id: '1',
    name: 'Snowledge Discord',
    connected: false,
  },
  youtube: {
    id: '2',
    name: 'Snowledge YT',
    connected: false,
  },
  x: {
    id: '3',
    name: 'Snowledge X',
    connected: false,
  },
}

const mockEntities: Record<string, EntityMock[]> = {
  discord: [
    { id: 'c1', name: 'General', selected: true },
    { id: 'c2', name: 'Support', selected: false },
    { id: 'c3', name: 'Dev', selected: false },
  ],
  youtube: [
    { id: 'v1', name: 'Video 1', selected: true },
    { id: 'v2', name: 'Video 2', selected: false },
    { id: 'v3', name: 'Video 3', selected: false },
  ],
  x: [
    { id: 'p1', name: 'Post 1', selected: true },
    { id: 'p2', name: 'Post 2', selected: false },
    { id: 'p3', name: 'Post 3', selected: false },
  ],
}

const recurrenceOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

// ============
// Component: PlatformSettingsDialog
// ------------
// DESCRIPTION: Dialog to configure a single platform's account, recurrence, and entities
// PARAMS: platform: PlatformProps
// RETURNS: Dialog UI for the platform
// ============
function PlatformSettingsDialog({ platform }: { platform: PlatformProps }) {
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState<AccountMock>({ ...mockAccounts[platform.key] })
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [entities, setEntities] = useState<EntityMock[]>(mockEntities[platform.key]?.map(e => ({ ...e })) || [])
  const [saved, setSaved] = useState(false)

  // ============
  // Function: handleConnect
  // ------------
  // DESCRIPTION: Simulate account connection
  // PARAMS: none
  // RETURNS: void
  // ============
  const handleConnect = () => {
    router.push(platform.urlAuth);
  }
  const handleDisconnect = () => setAccount(a => ({ ...a, connected: false }))

  // ============
  // Function: handleRecurrenceChange
  // ------------
  // DESCRIPTION: Change recurrence value
  // PARAMS: value: string
  // RETURNS: void
  // ============
  const handleRecurrenceChange = (value: string) => setRecurrence(value as 'daily' | 'weekly' | 'monthly')

  // ============
  // Function: handleEntityToggle
  // ------------
  // DESCRIPTION: Toggle entity selection
  // PARAMS: id: string
  // RETURNS: void
  // ============
  const handleEntityToggle = (id: string) => setEntities(entities => entities.map(e => e.id === id ? { ...e, selected: !e.selected } : e))

  // ============
  // Function: handleSave
  // ------------
  // DESCRIPTION: Simulate save and show feedback
  // PARAMS: none
  // RETURNS: void
  // ============
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Settings for ${platform.name}`} className="flex items-center gap-1 px-2 justify-center">
          <Cog className="w-4 h-4" />
          <span>Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{platform.name} Settings</DialogTitle>
          <DialogDescription>
            Configure your account, fetch recurrence, and what to collect for this platform.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-4">
            <SocialIcon url={platform.url} bgColor={platform.color} style={{ height: 40, width: 40 }} />
            <div className="flex-1">
              <div className="font-semibold text-lg">{account.connected ? account.name : 'Not connected'}</div>
              <div className="text-sm text-muted-foreground">{platform.name}</div>
            </div>
            {account.connected ? (
              <Button size="sm" variant="secondary" onClick={handleDisconnect} aria-label={`Disconnect ${platform.name}`}>
                <LogOut className="w-4 h-4 mr-1" /> Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={handleConnect} aria-label={`Connect ${platform.name}`}>
                <LogIn className="w-4 h-4 mr-1" /> Connect
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${platform.key}-recurrence`} className="font-medium">Recurrence</label>
            <Select value={recurrence} onValueChange={handleRecurrenceChange}>
              <SelectTrigger id={`${platform.key}-recurrence`} className="w-64">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-medium mb-1">{platform.type.charAt(0).toUpperCase() + platform.type.slice(1)} to collect</div>
            <div className="flex flex-col gap-1">
              {entities.map(entity => (
                <label key={entity.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={entity.selected}
                    onCheckedChange={() => handleEntityToggle(entity.id)}
                    disabled={!account.connected}
                    aria-label={`Select ${entity.name}`}
                  />
                  <span className={account.connected ? '' : 'text-muted-foreground'}>{entity.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} aria-label="Save settings" className="w-32" size="sm">
            Save
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" className="w-32" size="sm" aria-label="Close dialog">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
        {saved && (
          <div className="text-green-600 text-center mt-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Settings saved!
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PlatformSettingsDialog 