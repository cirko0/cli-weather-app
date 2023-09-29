#!/usr/bin/env node

import fetchWeather from "./weather.js";
import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs";

const prompt = inquirer.createPromptModule();

const listLocationOptions = [
  {
    type: "list",
    name: "locationoption",
    message: "Choose how will you inform us about your location:",
    choices: ["City Name", "Zip Code"],
    default: "City Name",
  },
];

const listTemperatureUnit = [
  {
    type: "list",
    name: "unit",
    message: `Choose temperature unit:`,
    choices: ["°C", "°F"],
    default: process.env.UNIT,
  },
];

const checkWeather = () => {
  prompt(listLocationOptions).then((answersList) => {
    prompt({
      type: "input",
      name: "data",
      message: `Enter ${answersList.locationoption}:`,
    }).then((answersInput) => {
      let answers = {
        data: answersInput.data,
        locationoption: answersList.locationoption,
      };
      fetchWeather(answers);
    });
  });
};

program
  .name("weather-cli")
  .version("1.0.0", "-v, --version", "output the current version")
  .description("Weather app that informs you about temperature in your city.");

program.command("exit").action(() => {
  process.exit();
});

program
  .command("set-location")
  .alias("sl")
  .description(
    "Allow users to set a default location for quicker weather checks."
  )
  .action(() => {
    prompt({
      type: "input",
      name: "location",
      message: `Enter default location:`,
    }).then((answers) => {
      fs.readFile("./config.env", "utf-8", function (err, data) {
        const updatedContent = data.replace(
          /^LOCATION=.+$/m,
          `LOCATION=${answers.location}`
        );
        fs.writeFile("./config.env", updatedContent, (err) => {
          if (err) {
            console.log("Error while setting default location.", err);
          } else {
            console.log("Setting default location was successful.");
          }

          process.exit();
        });
      });
    });
  });

program
  .command("set-units")
  .alias("su")
  .description(
    "Allow users to set default units (Celsius or Fahrenheit) for displaying."
  )
  .action(() => {
    prompt(listTemperatureUnit).then((answers) => {
      fs.readFile("./config.env", "utf-8", function (err, data) {
        const updatedContent = data.replace(
          /^UNIT=.+$/m,
          `UNIT=${answers.unit}`
        );
        fs.writeFile("./config.env", updatedContent, (err) => {
          if (err) {
            console.log("Error while setting default unit.", err);
          } else {
            console.log("Setting default unit was successful.");
          }
          process.exit();
        });
      });
    });
  });

program
  .command("weather")
  .alias("w")
  .option("-s", "--search")
  .description(
    "Fetch and display the current weather based on the user's input (city or zip code)."
  )
  .action((option) => {
    if (option.s || option.search) {
      checkWeather();
    } else if (process.env.LOCATION) {
      console.log("Getting data from api...");
      fetchWeather({
        data: process.env.LOCATION,
        locationoption: "City Name",
      });
    } else {
      checkWeather();
    }
  });

program.parse(process.argv);
