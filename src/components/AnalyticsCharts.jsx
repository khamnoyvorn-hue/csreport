import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/excelParser';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export function AnalyticsCharts({ csList, t }) {
  if (!csList || csList.length === 0) return null;

  // Sort top 8 CS agents by Refill volume
  const topByRefill = [...csList]
    .sort((a, b) => b.refill - a.refill)
    .slice(0, 8);

  const barData = {
    labels: topByRefill.map(c => c.csName.replace('cs_', '')),
    datasets: [
      {
        label: t.refill,
        data: topByRefill.map(c => c.refill),
        backgroundColor: 'rgba(56, 189, 248, 0.75)',
        borderRadius: 6,
      },
      {
        label: t.withdraw,
        data: topByRefill.map(c => c.withdraw),
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderRadius: 6,
      },
      {
        label: t.netResultCol,
        data: topByRefill.map(c => c.result),
        backgroundColor: topByRefill.map(c => c.result >= 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)'),
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Kantumruy Pro, Inter', size: 11, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Kantumruy Pro, Inter', size: 10 } },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { family: 'Kantumruy Pro, Inter', size: 10 },
          callback: (value) => `$${value}`
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  // Top 5 CS Refill Share (Doughnut)
  const top5Refill = [...csList]
    .sort((a, b) => b.refill - a.refill)
    .slice(0, 5);

  const otherRefill = csList
    .slice(5)
    .reduce((sum, c) => sum + c.refill, 0);

  const doughnutLabels = [...top5Refill.map(c => c.csName.replace('cs_', '')), t.others];
  const doughnutDataValues = [...top5Refill.map(c => c.refill), otherRefill];

  const doughnutData = {
    labels: doughnutLabels,
    datasets: [
      {
        data: doughnutDataValues,
        backgroundColor: [
          '#38bdf8',
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#ec4899',
          '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#0f172a'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: 'Kantumruy Pro, Inter', size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${formatCurrency(context.raw)}`
        }
      }
    },
    cutout: '68%'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '14px',
      marginBottom: '16px'
    }}>
      {/* 1. Bar Chart */}
      <div className="glass-card" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2px', color: 'var(--text-main)' }}>
          {t.chartTitleBar}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
          {t.chartSubBar}
        </p>
        <div style={{ height: '230px' }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* 2. Doughnut Share Chart */}
      <div className="glass-card" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2px', color: 'var(--text-main)' }}>
          {t.chartTitleDoughnut}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
          {t.chartSubDoughnut}
        </p>
        <div style={{ height: '230px' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}
