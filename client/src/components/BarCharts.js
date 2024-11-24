import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale } from 'chart.js/auto';

Chart.register(CategoryScale);

const BarCharts = ({ calculations }) => {
  const [stesspiChartData, setStesspiChartData] = useState(null);
  const [mtesspiChartData, setMtesspiChartData] = useState(null);

  useEffect(() => {
    if (calculations && calculations.length > 0) {
      const stesspiCalculations = calculations.filter(
        (calculation) => calculation.stesspi !== undefined && calculation.stesspi > 0
      );
      const mtesspiCalculations = calculations.filter(
        (calculation) => calculation.mtesspi !== undefined && calculation.mtesspi > 0
      );
  
      const stesspiElementNames = stesspiCalculations.map((calculation) => calculation.name);
      const stesspiData = stesspiCalculations.map((calculation) => calculation.stesspi);
  
      const mtesspiElementNames = mtesspiCalculations.map((calculation) => calculation.name);
      const mtesspiData = mtesspiCalculations.map((calculation) => calculation.mtesspi);
  
      const colorMapping = {
        CL: 'rgba(255, 99, 132, 0.2)',
        EL: 'rgba(54, 162, 235, 0.2)',
        DL: 'rgba(255, 206, 86, 0.2)',
        NEL: 'rgba(75, 192, 192, 0.2)',
      };
  
      setStesspiChartData({
        labels: stesspiElementNames,
        datasets: [
          {
            label: 'STESSPI',
            backgroundColor: stesspiCalculations.map(
              (calc) => colorMapping[calc.category] || 'rgba(128, 128, 128, 0.2)'
            ),
            borderColor: 'black',
            borderWidth: 1,
            data: stesspiData,
          },
        ],
      });
  
      setMtesspiChartData({
        labels: mtesspiElementNames,
        datasets: [
          {
            label: 'MTESSPI',
            backgroundColor: mtesspiCalculations.map(
              (calc) => colorMapping[calc.category] || 'rgba(128, 128, 128, 0.2)'
            ),
            borderColor: 'black',
            borderWidth: 1,
            data: mtesspiData,
          },
        ],
      });
    } else {
      // Clear data when there are no calculations
      setStesspiChartData(null);
      setMtesspiChartData(null);
    }
  }, [calculations]);  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Energy Storage System Indexes',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Elements',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Index Values',
        },
        beginAtZero: true,
      },
    },
  };  

  return (
    <div>
      <h2>STESSPI Chart</h2>
      {stesspiChartData ? (
        <Bar data={stesspiChartData} options={chartOptions} />
      ) : (
        <p>No STESSPI data available</p>
      )}
      <h2>MTESSPI Chart</h2>
      {mtesspiChartData ? (
        <Bar data={mtesspiChartData} options={chartOptions} />
      ) : (
        <p>No MTESSPI data available</p>
      )}
    </div>
  );
  
};

export default BarCharts;
