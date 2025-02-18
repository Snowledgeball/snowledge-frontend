'use client'

import React, { useState } from 'react'
import TinyEditor from '@/components/shared/TinyEditor'
import { Switch } from '@/components/ui/switch'

const page = () => {
    const [enabled, setEnabled] = useState(false)

    return (
        <div>
            <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
            />
            <TinyEditor />
        </div>
    )
}

export default page