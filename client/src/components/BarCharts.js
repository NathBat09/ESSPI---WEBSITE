import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale } from 'chart.js/auto';

Chart.register(CategoryScale);

const BarCharts = ({ calculations }) => {
  const [stesspiChartData, setStesspiChartData] = useState(null);
  const [mtesspiChartData, setMtesspiChartData] = useState(null);

  useEffect(() => {
    console.log("Calculations data:", calculations);

    if (calculations && calculations.length > 0) {
      const stesspiCalculations = calculations.filter(calculation => calculation.stesspi !== undefined && calculation.stesspi > 0);
      const mtesspiCalculations = calculations.filter(calculation => calculation.mtesspi !== undefined && calculation.mtesspi > 0);

      console.log("STESSPI Calculations:", stesspiCalculations);
      console.log("MTESSPI Calculations:", mtesspiCalculations);

      const stesspiElementNames = stesspiCalculations.map(calculation => calculation.name);
      const stesspiData = stesspiCalculations.map(calculation => ({
        value: calculation.stesspi.toFixed(2),
        category: calculation.category
      }));

      const mtesspiElementNames = mtesspiCalculations.map(calculation => calculation.name);
      const mtesspiData = mtesspiCalculations.map(calculation => ({
        value: calculation.mtesspi.toFixed(2),
        category: calculation.category
      }));

      const colorMapping = {
        CL: 'rgba(255, 99, 132, 0.2)',
        EL: 'rgba(54, 162, 235, 0.2)',
        DL: 'rgba(255, 206, 86, 0.2)',
        NEL: 'rgba(75, 192, 192, 0.2)'
      };

      const stesspiChartData = {
        labels: stesspiElementNames,
        datasets: [{
          label: 'STESSPI',
          backgroundColor: stesspiData.map(data => colorMapping[data.category]),
          borderColor: 'black',
          borderWidth: 1,
          hoverBackgroundColor: stesspiData.map(data => colorMapping[data.category]),
          hoverBorderColor: 'black',
          data: stesspiData.map(data => data.value),
        }],
      };

      const mtesspiChartData = {
        labels: mtesspiElementNames,
        datasets: [{
          label: 'MTESSPI',
          backgroundColor: mtesspiData.map(data => colorMapping[data.category]),
          borderColor: 'black',
          borderWidth: 1,
          hoverBackgroundColor: mtesspiData.map(data => colorMapping[data.category]),
          hoverBorderColor: 'black',
          data: mtesspiData.map(data => data.value),
        }],
      };

      setStesspiChartData(stesspiChartData);
      setMtesspiChartData(mtesspiChartData);
    }
  }, [calculations]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 18
          }
        }
      },
      title: {
        display: true,
        text: 'Chart Title',
        font: {
          size: 24
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 40
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 40
          }
        }
      }
    }
  };

  return (
    <div>
      <h2>STESSPI Chart</h2>
      {stesspiChartData && <Bar data={stesspiChartData} options={chartOptions} />}
      <h2>MTESSPI Chart</h2>
      {mtesspiChartData && <Bar data={mtesspiChartData} options={chartOptions} />}
    </div>
  );
};

export default BarCharts;
