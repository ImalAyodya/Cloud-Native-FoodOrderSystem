import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const OrderStatusChart = ({ ordersByStatus }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (ordersByStatus.length === 0) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Define colors for each status
    const getStatusColor = (status) => {
      const colors = {
        'Pending': '#FCD34D',      // Yellow
        'Confirmed': '#60A5FA',    // Blue
        'Preparing': '#F97316',    // Orange
        'Ready for Pickup': '#10B981', // Emerald
        'On the way': '#6366F1',   // Indigo
        'Delivered': '#2563EB',    // Blue
        'Cancelled': '#EF4444',    // Red
        'Failed': '#DC2626',       // Red
        'Refunded': '#4338CA',     // Indigo
        'Completed': '#10B981'     // Green
      };
      return colors[status] || '#9CA3AF'; // Default gray
    };

    // Prepare data for chart
    const labels = ordersByStatus.map(item => item.status);
    const data = ordersByStatus.map(item => item.count);
    const backgroundColor = ordersByStatus.map(item => getStatusColor(item.status));

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderColor: 'white',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              boxWidth: 12,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100) + '%';
                return `${label}: ${value} (${percentage})`;
              }
            }
          }
        },
        cutout: '70%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [ordersByStatus]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Status Distribution</h2>
      
      <div className="relative h-80">
        {ordersByStatus.length > 0 ? (
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

export default OrderStatusChart;