import React from "react";
import { useTranslation } from "react-i18next";
import {
  SentimentMonitor,
  SignalsDetector,
  AIAssistant,
  MonetizationTool,
  AggregatorTool,
  TrendScannerTool,
  CollabEditorTool,
  TemplatesTools,
  FactCheckerTool,
  CustomizerTool,
  SchedulerTool,
  AnalyticsTool,
  MultiChannelTool,
  AmplifierTool,
} from "./factice";

interface ToolSelectorProps {
  selectedTool: string | null;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedTool }) => {
  const { t } = useTranslation();

  if (!selectedTool) return null;

  // Sélectionner le bon composant en fonction de l'outil
  switch (selectedTool) {
    case "sentiment":
      return <SentimentMonitor />;

    case "signals":
      return <SignalsDetector />;

    case "ai-assistant":
      return <AIAssistant />;

    case "monetization":
      return <MonetizationTool />;

    case "aggregator":
      return <AggregatorTool />;

    case "trend-scanner":
      return <TrendScannerTool />;

    case "collab-editor":
      return <CollabEditorTool />;

    case "templates":
      return <TemplatesTools />;

    case "fact-checker":
      return <FactCheckerTool />;

    case "customizer":
      return <CustomizerTool />;

    case "scheduler":
      return <SchedulerTool />;

    case "analytics":
      return <AnalyticsTool />;

    case "multi-channel":
      return <MultiChannelTool />;

    case "amplifier":
      return <AmplifierTool />;

    default:
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">
            {t("tools.development", {
              name: <span className="font-bold">{selectedTool}</span>,
            })}
          </p>
        </div>
      );
  }
};
