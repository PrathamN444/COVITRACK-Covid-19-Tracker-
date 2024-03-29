import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@mui/material';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat} from './util';
import Linegraph from './Linegraph';
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")      // worldwide cases and views will be by default
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      })
  }, [])


  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")   // for the dropdown list of countries
        .then(response => response.json())
        .then(data => {
          const countries = data.map((country) => ({
            value: country.countryInfo.iso2,
            name: country.country,
          }));
          const newData = sortData(data);
          setTableData(newData);        // List of the countries which will be sorted acc to no of the cases 
          setMapCountries(data);
          setCountries(countries);
        })
    }
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {      // fetch data of the country after selecting the country in the dropdown otherwise show for the worldwide as default
    const countryCode = event.target.value;

    const url = (countryCode === "worldwide") 
          ? "https://disease.sh/v3/covid-19/all" 
          : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox 
            isRed
            active={casesType === "cases"}
            onClick = {e => setCasesType("cases")}
            title="Coronavirus cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} 
          />
          <InfoBox 
            active={casesType === "recovered"}
            onClick = {e => setCasesType("recovered")}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} 
          />
          <InfoBox 
            isRed
            active={casesType === "deaths"}
            onClick = {e => setCasesType("deaths")}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} 
          />
        </div>

        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <div>
        <Card className="app__right">
          <CardContent className='right__upper'>
            <h3>Live cases by country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <Linegraph className="app__graph" casesType={casesType}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
