import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface SubscribersChartProps {
    data?: {
        labels: string[];
        values: number[];
    };
    className?: string;
}

export const SubscribersChart = ({
    data = {
        labels: ['Jan', 'Fév', 'Mar', 'Avr'],
        values: [120, 450, 280, 190]
    },
    className = ''
}: SubscribersChartProps) => {
    const barData = {
        labels: data.labels,
        datasets: [{
            label: 'Évolution des abonnés',
            data: data.values,
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderWidth: 0,
            borderRadius: 4,
            barThickness: 20,
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
        scales: {
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: 'rgba(243, 244, 246, 0.4)',
                },
                border: {
                    display: false,
                },
                ticks: {
                    stepSize: 200,
                    max: 600,
                }
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className={`h-[200px] ${className}`}>
            <Bar data={barData} options={options} />
        </div>
    );
}; 