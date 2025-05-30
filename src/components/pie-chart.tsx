// components/charts/PieChart.tsx
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from "chart.js";
import { useTheme } from "next-themes";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
}

export function PieChart({ data }: PieChartProps) {
    
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
   if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Generate distinct colors for each category
  const generateColors = (count: number) => {
    const baseColors = [
      "#3b82f6", // blue-500
      "#10b981", // emerald-500
      "#f59e0b", // amber-500
      "#ef4444", // red-500
      "#8b5cf6", // violet-500
      "#ec4899", // pink-500
      "#06b6d4", // cyan-500
      "#f97316", // orange-500
      "#84cc16", // lime-500
      "#64748b"  // slate-500
    ];
    
    return Array.from({ length: count }, (_, i) => 
      baseColors[i % baseColors.length]
    );
  };

  // Prepare chart data
  const chartData: ChartData<"pie"> = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: generateColors(data.length),
        borderColor: isDarkMode ? "#1e293b" : "#ffffff", // slate-800 or white
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  };

  // Chart options
  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: isDarkMode ? "#e2e8f0" : "#334155",
          font: {
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            // Calculate total manually from dataset
            const dataset = context.chart.data.datasets[context.datasetIndex];
            const total = Array.isArray(dataset.data)
              ? dataset.data.reduce((sum: number, val) => typeof val === "number" ? sum + val : sum, 0)
              : 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
        titleColor: isDarkMode ? "#e2e8f0" : "#334155",
        bodyColor: isDarkMode ? "#cbd5e1" : "#475569",
        borderColor: isDarkMode ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 5,
        usePointStyle: true,
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 13,
          weight: "bold"
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    },
    cutout: "60%"
  };

  return (
    <div className="h-full w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
}