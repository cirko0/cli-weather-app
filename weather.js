import https from "https";
import dotenv from "dotenv";
import chalk from "chalk";
import boxen from "boxen";

dotenv.config({ path: "./config.env" });

const key = process.env.API_KEY;

function convertTemperature(data, unit) {
  let temp;

  if (unit === "°C") {
    temp = data + "°C";
  } else if (unit === "°F") {
    temp = (+data * 1.8 + 32).toFixed(2) + "°F";
  } else {
    console.log(
      "That unit does not exist or is not yet implemented. Please try some other ones."
    );
  }

  return temp;
}

function suggestClothing(weatherData) {
  const temperature = weatherData.main.temp;
  const windSpeed = weatherData.wind.speed;
  const weatherCondition = weatherData.weather[0].main;

  // Clothing suggestions based on temperature and wind speed
  function suggestClothingByConditions(temp, wind) {
    if (temp < 5) {
      if (wind < 1) {
        return "It's very cold with calm wind. Wear a heavy jacket, scarf, hat, and gloves.";
      } else if (wind < 5) {
        return "It's very cold with a light breeze. Consider a warm jacket or coat.";
      } else if (wind < 10) {
        return "It's very cold with moderate wind. A windproof jacket would be beneficial.";
      } else {
        return "It's very cold with strong wind. Dress warmly and shield against the wind.";
      }
    } else if (temp < 10) {
      if (wind < 1) {
        return "It's cold with calm wind. A warm jacket or coat would be suitable.";
      } else if (wind < 5) {
        return "It's cold with a light breeze. A jacket or coat would be good.";
      } else if (wind < 10) {
        return "It's cold with moderate wind. Consider a windbreaker or a sweater.";
      } else {
        return "It's cold with strong wind. Dress warmly and consider a windproof jacket.";
      }
    } else if (temp < 20) {
      if (wind < 1) {
        return "It's moderate with calm wind. A light jacket or layers would be sufficient.";
      } else if (wind < 5) {
        return "It's moderate with a light breeze. A light jacket or layers would be good.";
      } else if (wind < 10) {
        return "It's moderate with moderate wind. Consider a windbreaker or a sweater.";
      } else {
        return "It's moderate with strong wind. Dress accordingly and shield against the wind.";
      }
    } else {
      if (wind < 1) {
        return "It's hot with calm wind. Light and breathable clothing would be comfortable.";
      } else if (wind < 5) {
        return "It's hot with a light breeze. Light clothing like a t-shirt or blouse would be suitable.";
      } else if (wind < 10) {
        return "It's hot with moderate wind. Consider lighter layers or a breathable jacket.";
      } else {
        return "It's hot with strong wind. Choose breathable clothing that shields against the wind.";
      }
    }
  }

  // Additional weather-based suggestions
  function suggestAdditionalWeather(condition) {
    if (condition === "Rain") {
      return "It's raining! Don't forget your umbrella and waterproof jacket.";
    } else if (condition === "Snow") {
      return "It's snowing! Dress warmly with layers and waterproof boots.";
    } else if (condition === "Thunderstorm") {
      return "There's a thunderstorm! Stay indoors and be safe.";
    } else if (condition === "Clear") {
      return "Clear skies! Enjoy the sunshine, but don't forget sunscreen.";
    } else {
      return "Weather conditions might be varied. Consider checking for updates.";
    }
  }

  // Get clothing suggestions based on weather data
  const clothingSuggestion = suggestClothingByConditions(
    temperature,
    windSpeed
  );
  const additionalSuggestion = suggestAdditionalWeather(weatherCondition);

  // Return the suggestions
  return {
    clothing: clothingSuggestion,
    additional: additionalSuggestion,
  };
}

function fetchWeather(answers) {
  try {
    let url;

    if (answers.locationoption === "Zip Code")
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${answers.data},us&appid=${key}&units=metric`;
    else if (answers.locationoption === "City Name")
      url = `https://api.openweathermap.org/data/2.5/weather?q=${answers.data}&appid=${key}&units=metric`;
    else
      console.log(
        "That option still does not exist in our application try some other ones."
      );

    https.get(url, (Response) => {
      if (+Response.statusCode === 200) {
        let body = "";
        Response.on("data", (buffer) => {
          body += buffer;
        });

        Response.on("end", () => {
          const data = JSON.parse(body);
          const location = data.name;
          let temp;
          if (answers.unit) {
            temp = convertTemperature(data.main.temp, answers.unit);
          } else if (process.env.UNIT) {
            temp = convertTemperature(data.main.temp, process.env.UNIT);
          }
          const suggestions = suggestClothing(data);

          const title = chalk.bold.underline(`Location: ${location}`);
          const temperature = chalk.yellow(`Current Temperature: ${temp}`);
          const conditionText = chalk.cyan(
            `Conditions: ${suggestions.clothing.split(".")[0] + "."}`
          );
          const recommendationText = chalk.green(
            `Recommendation: ${suggestions.clothing.split(".")[1] + "."}`
          );
          const noteText = chalk.grey(`Note: ${suggestions.additional}`);

          // Combine styled texts into a formatted box
          const formattedWeatherInfo = boxen(
            `${title}\n${temperature}\n\n${conditionText}\n\n${recommendationText}\n\n${noteText}`,
            { padding: 1, borderStyle: "double" }
          );

          console.log(formattedWeatherInfo);
        });
      } else {
        console.log("Something went wrong: " + Response.statusCode + " error");
        process.exit();
      }
    });
  } catch (err) {
    console.log("Something went very wrong. Try again later.", err.statusCode);
  }
}

export default fetchWeather;
