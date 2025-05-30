// components/charts/LineChart.tsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function LineChart({ 
  data, 
  categories 
}: {
  data: {
    name: string;
    data: number[];
    color: string;
  }[];
  categories: string[];
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const chartData = {
    labels: categories,
    datasets: data.map(item => ({
      label: item.name,
      data: item.data,
      borderColor: item.color,
      backgroundColor: `${item.color}20`,
      tension: 0.3,
      fill: true,
    })),
  };

  return <Line options={options} data={chartData} />;
}