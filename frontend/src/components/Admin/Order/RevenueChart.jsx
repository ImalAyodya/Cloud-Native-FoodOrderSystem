import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const RevenueChart = ({ dailyRevenue }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (dailyRevenue.length === 0) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Format dates for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Prepare data for chart
    const labels = dailyRevenue.map(item => formatDate(item.date));
    const revenueData = dailyRevenue.map(item => item.revenue);
    const ordersData = dailyRevenue.map(item => item.orders);

    // Calculate gradient for revenue line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
    gradient.addColorStop(1, 'rgba(249, 115, 22, 0.0)');

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            borderColor: '#F97316',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#F97316',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Orders',
            data: ordersData,
            borderColor: '#60A5FA',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderDash: [5, 5],
            fill: false,
            pointBackgroundColor: '#60A5FA',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.dataset.label.includes('Revenue')) {
                  label += new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'LKR', 
                    minimumFractionDigits: 2
                  }).format(context.raw);
                } else {
                  label += context.raw;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Revenue ($)',
              font: {
                size: 12
              }
            },
            ticks: {
              callback: function(value) {
                return 'LKR ' + value;
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Number of Orders',
              font: {
                size: 12
              }
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dailyRevenue]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue & Orders (Last 7 Days)</h2>
      
      <div className="relative h-80">
        {dailyRevenue.length > 0 ? (
          <canvas ref={chartRef} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No data available for chart</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;