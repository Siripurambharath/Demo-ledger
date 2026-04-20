import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import "./DashboardCard.css"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

const DashboardCharts = () => {
  // Pie Chart Data
  const regionalData = {
    labels: ["Delhi", "Mumbai", "Bangalore", "Chennai", "Others"],
    datasets: [
      {
        label: "Retailers",
        data: [67, 54, 43, 38, 45],
        backgroundColor: ["#4F81FF", "#28A745", "#FF9800", "#E53935", "#9C27B0"],
        borderWidth: 1,
      },
    ],
  };

  const regionalOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: { size: 14 },
          boxWidth: 15,
        },
      },
      title: {
        display: true,
        text: "Regional Distribution",
        font: { size: 16, weight: "bold" },
      },
    },
  };

  // Bar Chart Data
  const categoryData = {
    labels: ["Electronics", "General Store", "Textiles", "Groceries", "Medical"],
    datasets: [
      {
        label: "Retailers",
        data: [100, 75, 50, 35, 15],
        backgroundColor: "#4F81FF",
        borderRadius: 5,
      },
    ],
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Category Distribution",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 12 } },
      },
      y: {
        ticks: { font: { size: 12 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <div className="chart-container">
          <Pie data={regionalData} options={regionalOptions} />
        </div>
      </div>
      
      <div className="chart-wrapper">
        <div className="chart-container">
          <Bar data={categoryData} options={categoryOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;