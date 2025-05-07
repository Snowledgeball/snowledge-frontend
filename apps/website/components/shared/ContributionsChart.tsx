import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ContributionsChartProps {
    data?: {
        active: number;
        pending: number;
    };
    className?: string;
}

export const ContributionsChart = ({
    data = { active: 65, pending: 35 },
    className = ''
}: ContributionsChartProps) => {
    const pieData = {
        labels: ['Contributions actives', 'Contributions en attente'],
        datasets: [{
            data: [data.active, data.pending],
            backgroundColor: [
                'rgba(168, 85, 247, 0.8)',
                'rgba(243, 244, 246, 0.8)',
            ],
            borderWidth: 0,
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        cutout: '0%',
    };

    return (
        <div className={`h-[200px] flex items-center justify-center ${className}`}>
            <Pie data={pieData} options={options} />
        </div>
    );
}; 