const axios = require('axios');

exports.getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city || 'Colombo'}&appid=${apiKey}&units=metric`;
    }
    
    const response = await axios.get(url);
    res.json({
      temp: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      windSpeed: response.data.wind.speed,
      rain: response.data.rain ? response.data.rain['1h'] : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Weather API error', error: error.message });
  }
};

exports.getForecast = async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city || 'Colombo'}&appid=${apiKey}&units=metric`;
    }
    
    const response = await axios.get(url);
    const dailyForecast = {};
    
    response.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date,
          temps: [],
          humidity: [],
          rain: 0,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        };
      }
      dailyForecast[date].temps.push(item.main.temp);
      dailyForecast[date].humidity.push(item.main.humidity);
      if (item.rain) dailyForecast[date].rain += item.rain['3h'] || 0;
    });
    
    const forecast = Object.values(dailyForecast).map(day => ({
      ...day,
      avgTemp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
      avgHumidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length
    })).slice(0, 5);
    
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ message: 'Forecast API error', error: error.message });
  }
};

exports.getFarmingAdvice = async (req, res) => {
  try {
    const { temp, humidity, rain, description } = req.query;
    let advice = [];
    
    if (rain > 5) advice.push("Heavy rain expected — postpone fertilizing and harvesting");
    else if (rain > 0) advice.push("Light rain — good for planting new saplings");
    else advice.push("No rain — schedule irrigation for today");
    
    if (temp > 35) advice.push("High temperature — ensure adequate shade for young trees");
    else if (temp < 20) advice.push("Cool weather — reduce watering frequency");
    
    if (humidity > 80) advice.push("High humidity — monitor for fungal diseases");
    else if (humidity < 40) advice.push("Low humidity — increase misting for young plants");
    
    res.json({ advice, conditions: { temp, humidity, rain, description } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};