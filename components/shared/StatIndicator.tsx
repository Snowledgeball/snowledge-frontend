interface StatIndicatorProps {
    type: 'points' | 'wallet';
    value: number;
    icon: React.ReactNode;
    valueClassName?: string;
    noBorder?: boolean;
}

export function StatIndicator({
    type,
    value,
    icon,
    valueClassName = "text-gray-900",
    noBorder = false
}: StatIndicatorProps) {
    const formattedValue = type === 'points'
        ? value.toLocaleString('fr-FR')
        : value.toFixed(2);

    return (
        <div className={`flex items-center gap-2 px-4 py-1 ${!noBorder ? 'border-r border-gray-200' : ''}`}>
            {icon}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">{type.toUpperCase()}</span>
                <span className={`font-bold text-sm ${valueClassName}`}>{formattedValue}</span>
            </div>
        </div>
    );
} 