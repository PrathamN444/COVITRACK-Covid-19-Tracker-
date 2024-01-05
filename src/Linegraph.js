import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import { Chart, registerables } from 'chart.js';    //  'chart.js' is a popular JavaScript library for creating charts and graphs. 
// here we can also directly import the linearbar, categorybar and other components.
Chart.register(...registerables);  // setting up the chart.js library and registers additional elements and features and ensures that the necessary components and plugins are available for use when creating charts in the application.

const options = {
    legend: {
      display: false,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    maintainAspectRatio: false,
    tooltips: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (tooltipItem, data) {
          return numeral(tooltipItem.value).format("+0,0");
        },
      },
    },
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            format: "MM/DD/YY",
            tooltipFormat: "ll",
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, values) {
              return numeral(value).format("0a");
            },
          },
        },
      ],
    },
  };

const buildChartData = (data, {casesType}) => {
    let chartData = [];
    let lastDataPoint;
    for (let date in data.cases) {
        if (lastDataPoint) {
            let newDataPoint = {
                x: date,
                y: data[casesType][date] - lastDataPoint,
            }
            chartData.push(newDataPoint);
        }
        lastDataPoint = data[casesType][date];
    }
    return chartData;
}; 

function Linegraph({casesType}) {
    const [data, setData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
          await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            let chartData = buildChartData(data, {casesType});
            setData(chartData);
          });
      };
    
      fetchData();
    }, [casesType]);

    return (
        <div>  
            {data?.length > 0 && (  // data?.length == if(data) then data.length) | (spcly used for dealing with nested obejcts and properties that might be 'null' or'undefined')  if data is null expression evaluate to undefined otherwise it will return the length of the array.
              <Line
                options={options}
                data={{
                  datasets: [
                    {
                      backgroundColor: "rgba(204, 16, 52, 0.5)",
                      borderColor: "#CC1034",
                      data: data,
                    },
                  ],
                }}
              />
            )}
        </div>
    );
}


export default Linegraph

