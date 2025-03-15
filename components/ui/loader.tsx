"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    color?: "blue" | "gray" | "white" | "gradient" | "rainbow";
    className?: string;
    text?: string;
    fullScreen?: boolean;
    variant?: "spinner" | "dots" | "pulse" | "wave" | "ring";
    textPosition?: "right" | "bottom";
}

export function Loader({
    size = "md",
    color = "blue",
    className = "",
    text,
    fullScreen = false,
    variant = "spinner",
    textPosition = "bottom",
}: LoaderProps) {
    // Tailles pour les différents variants
    const sizeMap = {
        sm: {
            spinner: "h-3 w-3 border-[1.5px]",
            dot: "h-1.5 w-1.5",
            pulse: "h-1.5 w-1.5",
            wave: "h-3 w-1",
            ring: "h-5 w-5 border-2",
        },
        md: {
            spinner: "h-6 w-6 border-2",
            dot: "h-2.5 w-2.5",
            pulse: "h-2.5 w-2.5",
            wave: "h-5 w-1.5",
            ring: "h-10 w-10 border-3",
        },
        lg: {
            spinner: "h-10 w-10 border-[3px]",
            dot: "h-3.5 w-3.5",
            pulse: "h-3.5 w-3.5",
            wave: "h-7 w-2",
            ring: "h-16 w-16 border-4",
        },
    };

    // Espacement entre les éléments
    const gapMap = {
        sm: "gap-1",
        md: "gap-1.5",
        lg: "gap-2",
    };

    // Couleurs pour les différents variants
    const colorMap = {
        blue: {
            spinner: "border-blue-600 border-t-transparent text-blue-600",
            dot: "bg-blue-600 text-blue-600",
            pulse: "bg-blue-600 text-blue-600",
            wave: "bg-blue-600 text-blue-600",
            ring: "border-blue-600 text-blue-600",
        },
        gray: {
            spinner: "border-gray-600 border-t-transparent text-gray-600",
            dot: "bg-gray-600 text-gray-600",
            pulse: "bg-gray-600 text-gray-600",
            wave: "bg-gray-600 text-gray-600",
            ring: "border-gray-600 text-gray-600",
        },
        white: {
            spinner: "border-white border-t-transparent text-white",
            dot: "bg-white text-white",
            pulse: "bg-white text-white",
            wave: "bg-white text-white",
            ring: "border-white text-white",
        },
        gradient: {
            spinner: "border-blue-600 border-t-transparent text-blue-600",
            dot: "bg-gradient-to-r from-blue-600 to-indigo-600 text-blue-600",
            pulse: "bg-gradient-to-r from-blue-600 to-indigo-600 text-blue-600",
            wave: "bg-gradient-to-r from-blue-600 to-indigo-600 text-blue-600",
            ring: "border-blue-600 text-blue-600",
        },
        rainbow: {
            spinner: "border-blue-600 border-t-transparent text-blue-600",
            dot: "bg-blue-600 text-blue-600",
            pulse: "bg-blue-600 text-blue-600",
            wave: "bg-blue-600 text-blue-600",
            ring: "border-blue-600 text-blue-600",
        },
    };

    // Classes pour le conteneur
    const containerClasses = fullScreen
        ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        : "flex items-center justify-center";

    // Rendu du spinner
    const renderSpinner = () => (
        <div className="relative">
            <div
                className={cn(
                    "rounded-full relative",
                    sizeMap[size].spinner,
                    colorMap[color].spinner,
                    color === "rainbow" && "rainbow-border"
                )}
                style={color === "gradient" ? { animation: "gradient-spin 1.5s linear infinite, spin 0.8s linear infinite" } : { animation: "spin 0.8s linear infinite, hue-rotate 3s linear infinite" }}
            >
                {color === "rainbow" && (
                    <div className="absolute inset-0 rounded-full animate-spin" style={{
                        borderWidth: size === "sm" ? "1.5px" : size === "md" ? "2px" : "3px",
                        borderStyle: "solid",
                        borderColor: "transparent",
                        borderTopColor: "currentColor",
                        filter: "hue-rotate(0deg)",
                        animation: "spin 0.8s linear infinite, hue-rotate 3s linear infinite"
                    }} />
                )}
            </div>
        </div>
    );

    // Rendu des dots
    const renderDots = () => (
        <div className={cn("flex", gapMap[size])}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-full",
                        sizeMap[size].dot,
                        color === "gradient"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                            : color === "rainbow"
                                ? "rainbow-bg"
                                : colorMap[color].dot.split(" ")[0]
                    )}
                    style={{
                        animation: "bounce 1.2s infinite",
                        animationDelay: `${i * 0.15}s`,
                        ...(color === "rainbow" && { filter: `hue-rotate(${i * 120}deg)` })
                    }}
                />
            ))}
        </div>
    );

    // Rendu du pulse
    const renderPulse = () => (
        <div className={cn("flex", gapMap[size])}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-full",
                        sizeMap[size].pulse,
                        color === "gradient"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                            : color === "rainbow"
                                ? "rainbow-bg"
                                : colorMap[color].pulse.split(" ")[0]
                    )}
                    style={{
                        animation: "pulse 1.5s infinite",
                        animationDelay: `${i * 0.15}s`,
                        ...(color === "rainbow" && { filter: `hue-rotate(${i * 120}deg)` })
                    }}
                />
            ))}
        </div>
    );

    // Rendu de l'animation wave
    const renderWave = () => (
        <div className={cn("flex", gapMap[size])}>
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-full",
                        sizeMap[size].wave,
                        color === "gradient"
                            ? "bg-gradient-to-b from-blue-600 to-indigo-600"
                            : color === "rainbow"
                                ? "rainbow-bg"
                                : colorMap[color].wave.split(" ")[0]
                    )}
                    style={{
                        animation: "wave 1s infinite",
                        animationDelay: `${i * 0.1}s`,
                        ...(color === "rainbow" && { filter: `hue-rotate(${i * 72}deg)` })
                    }}
                />
            ))}
        </div>
    );

    // Rendu de l'animation ring
    const renderRing = () => (
        <div className="relative">
            <div
                className={cn(
                    "rounded-full border-2 absolute inset-0 opacity-75",
                    sizeMap[size].ring,
                    color === "rainbow" ? "rainbow-border" : colorMap[color].ring.split(" ")[0]
                )}
                style={{
                    animation: "ring-pulse 1.5s infinite",
                }}
            />
            <div
                className={cn(
                    "rounded-full border-2",
                    sizeMap[size].ring,
                    color === "rainbow" ? "rainbow-border" : colorMap[color].ring.split(" ")[0]
                )}
                style={{
                    animation: color === "rainbow" ? "hue-rotate 3s linear infinite" : "",
                }}
            />
        </div>
    );

    // Sélection du variant à afficher
    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return renderDots();
            case "pulse":
                return renderPulse();
            case "wave":
                return renderWave();
            case "ring":
                return renderRing();
            case "spinner":
            default:
                return renderSpinner();
        }
    };

    // Obtenir la couleur du texte
    const getTextColor = () => {
        const textColorClass = colorMap[color][variant === "spinner" ? "spinner" : "dot"].split(" ").filter(c => c.startsWith("text-"))[0];
        return textColorClass || `text-${color === "white" ? "white" : "blue-600"}`;
    };

    // Rendu du texte avec le loader
    const renderContent = () => {
        if (!text) return renderLoader();

        // Déterminer la taille du texte en fonction de la taille du loader
        const textSizeClass = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

        // Créer un effet de texte plus élégant
        const textClasses = cn(
            textSizeClass,
            "font-medium tracking-wide",
            getTextColor(),
            color === "gradient" && "text-gradient",
            color === "rainbow" && "rainbow-text"
        );

        if (textPosition === "right") {
            return (
                <div className="flex items-center space-x-3">
                    {renderLoader()}
                    <div className="relative">
                        <span className={textClasses}>
                            {text}
                        </span>
                        {color === "gradient" && (
                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-600/40 to-indigo-600/40 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center space-y-2 group">
                {renderLoader()}
                <div className="relative">
                    <span className={textClasses}>
                        {text}
                    </span>
                    {color === "gradient" && (
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-600/40 to-indigo-600/40 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={containerClasses}>
            <div className={cn(
                "flex items-center justify-center",
                fullScreen && "bg-white p-6 rounded-xl shadow-lg",
                className
            )}>
                {renderContent()}
            </div>
            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateY(-8px);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse-text {
                    0%, 100% {
                        opacity: 0.8;
                    }
                    50% {
                        opacity: 1;
                    }
                }
                
                @keyframes wave {
                    0%, 100% {
                        transform: scaleY(1);
                        opacity: 0.7;
                    }
                    50% {
                        transform: scaleY(2);
                        opacity: 1;
                    }
                }
                
                @keyframes ring-pulse {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                
                @keyframes gradient-spin {
                    0% {
                        border-color: #2563eb;
                        border-top-color: transparent;
                        box-shadow: 0 0 5px rgba(37, 99, 235, 0.1);
                    }
                    25% {
                        border-color: #4f46e5;
                        border-top-color: transparent;
                        box-shadow: 0 0 8px rgba(79, 70, 229, 0.2);
                    }
                    50% {
                        border-color: #6366f1;
                        border-top-color: transparent;
                        box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
                    }
                    75% {
                        border-color: #4f46e5;
                        border-top-color: transparent;
                        box-shadow: 0 0 8px rgba(79, 70, 229, 0.2);
                    }
                    100% {
                        border-color: #2563eb;
                        border-top-color: transparent;
                        box-shadow: 0 0 5px rgba(37, 99, 235, 0.1);
                    }
                }
                
                @keyframes hue-rotate {
                    0% {
                        filter: hue-rotate(0deg);
                    }
                    100% {
                        filter: hue-rotate(360deg);
                    }
                }
                
                @keyframes text-shimmer {
                    0% {
                        background-position: -100% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                
                .rainbow-bg {
                    background-color: #2563eb;
                    animation: hue-rotate 3s linear infinite;
                }
                
                .rainbow-border {
                    border-style: solid;
                    border-color: #2563eb;
                    border-top-color: transparent;
                    animation: spin 0.8s linear infinite, hue-rotate 3s linear infinite;
                    box-shadow: 0 0 8px rgba(37, 99, 235, 0.2);
                }
                
                .text-gradient {
                    background: linear-gradient(90deg, #2563eb, #4f46e5, #6366f1, #4f46e5, #2563eb);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: text-shimmer 3s linear infinite;
                    text-shadow: 0 0 2px rgba(99, 102, 241, 0.1);
                }
                
                .rainbow-text {
                    background: linear-gradient(90deg, #ff0000, #ffa500, #ffff00, #008000, #0000ff, #4b0082, #ee82ee);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: text-shimmer 3s linear infinite;
                    text-shadow: 0 0 2px rgba(99, 102, 241, 0.1);
                }
            `}</style>
        </div>
    );
} 