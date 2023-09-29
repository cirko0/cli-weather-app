import https from "https";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const key = process.env.API_KEY;

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
          const name = data.name;
          let temp;

          if (process.env.UNIT === "°C") {
            temp = data.main.temp;
          } else if (process.env.UNIT === "°F") {
            temp = (+data.main.temp * 1.8 + 32).toFixed(2);
          } else {
            console.log(
              "That unit does not exist or is not yet implemented try some other ones."
            );
          }

          console.log(
            `The current temperature in ${name} is ${temp}${process.env.UNIT}.`
          );
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
