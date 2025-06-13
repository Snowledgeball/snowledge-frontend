import React from 'react';
import { Card } from '@repo/ui';

// ============
// Function: AnalysisDescription
// ------------
// DESCRIPTION: Displays a dynamic AI description block for trend, sentiment, or summary analysis.
// PARAMS:
//   - type: 'trend' | 'sentiment' | 'summary' (analysis type)
// RETURNS: JSX.Element
// ============
export function AnalysisDescription({ type }: { type: 'trend' | 'sentiment' | 'summary' }) {
  let title = ''
  let lines: string[] = []
  let extra = ''
  switch (type) {
    case 'trend':
      title = 'What does the AI do?'
      lines = [
        'Extracts top 1–5 trending topics',
        'For each: title, short summary, 2–4 key messages, activity level',
        'Lists most active/influential users',
      ]
      extra = 'No noise. No speculation. Just the essentials.'
      break
    case 'sentiment':
      title = 'What does the AI do?'
      lines = [
        'Calculates a confidence score for the detected sentiment',
        'Provides a summary of the main emotional trends',
        'Helps you quickly understand the mood of your community',
      ]
      extra = 'No speculation. Just a clear, data-driven sentiment analysis.'
      break
    case 'summary':
      title = 'What does the AI do?'
      lines = [
        'Extracts key topics and their summaries',
        'Highlights most active/influential users',
        'Provides a concise, actionable summary',
      ]
      extra = 'No noise. Just the essentials.'
      break
  }
  return (
    <Card className="w-full max-w-[90%] md:max-w-[95%] self-center p-6 bg-blue-50 border border-blue-300 text-blue-900 shadow-none">
      <div className="font-semibold mb-2 text-base">{title}</div>
      <div className="text-sm space-y-2">
        <ul className="list-disc ml-6 space-y-1">
          {lines.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
        <div className="mt-2">{extra}</div>
      </div>
    </Card>
  )
} 