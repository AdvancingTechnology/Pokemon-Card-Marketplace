'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  cardName: string;
  currentPrice: number;
}

export function PriceChart({ cardName, currentPrice }: PriceChartProps) {
  // Generate sample historical data for the last 30 days
  const generateHistoricalData = () => {
    const labels = [];
    const prices = [];
    const basePrice = currentPrice;

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      labels.push(format(date, 'MMM d'));

      // Generate realistic price fluctuations
      const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const trendComponent = (29 - i) * 0.002; // Slight upward trend
      const price = basePrice * (1 + randomVariation + trendComponent);
      prices.push(Math.round(price * 100) / 100);
    }

    return { labels, prices };
  };

  const { labels, prices } = generateHistoricalData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${cardName} - 30 Day Price History`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Price',
        data: prices,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Calculate price change
  const priceChange = prices[prices.length - 1] - prices[0];
  const priceChangePercent = ((priceChange / prices[0]) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">${currentPrice.toFixed(2)}</div>
          <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
            <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}</span>
            <span>({isPositive ? '+' : ''}{priceChangePercent}%)</span>
            <span className="text-gray-500">30d</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">1D</button>
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">1W</button>
          <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-full">1M</button>
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">3M</button>
          <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">1Y</button>
        </div>
      </div>
      <div className="h-64">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
