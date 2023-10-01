#!/usr/bin/env node

import figlet from "figlet";
import { program } from "commander";
import { createPromptModule } from "inquirer";
import { writeFile, readFile } from "fs/promises";
import fetchWeather from "./weather.js";
import boxen from "boxen";
import chalk from "chalk";

const prompt = createPromptModule();

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
  prompt(listTemperatureUnit).then((answersUnit) => {
    prompt(listLocationOptions).then((answersList) => {
      prompt({
        type: "input",
        name: "data",
        message: `Enter ${answersList.locationoption} (Temperature will be in ${answersUnit.unit}):`,
      }).then((answersInput) => {
        let answers = {
          data: answersInput.data,
          locationoption: answersList.locationoption,
          unit: answersUnit.unit,
        };
        fetchWeather(answers);
      });
    });
  });
};

function generateAsciiArt(text) {
  return new Promise((resolve, reject) => {
    figlet(text, function (err, data) {
      if (err) {
        reject("Error generating ASCII art");
      }
      resolve(data);
    });
  });
}

async function displayAppInfo() {
  process.stdout.write("\x1Bc");
  const appName = "WEATHER-CLI"; // Your app name
  const asciiArt = await generateAsciiArt(appName);
  console.log(chalk.yellow(asciiArt));
  console.log("\n");
  console.log(chalk.magenta("Usage: weather-cli weather --search\n"));
  console.log(
    chalk.green(
      boxen("Description: Weather app which fetches weather information.", {
        padding: 1,
      })
    )
  );

  console.log("\nOptions:");
  console.log("  -v, --version           Output the current version.");
  console.log("  -h, --help              Display help for command.");

  console.log("\nCommands:");
  console.log("  exit");
  console.log(
    "  set-location|sl         Allow users to set a default location."
  );
  console.log("  set-units|su            Allow users to set default units.");
  console.log(
    "  weather|w [options]     Fetch and display the current weather."
  );
  console.log("  help [command]          Display help for command.");
}

program
  .name("weather-cli")
  .version("1.0.0", "-v, --version", "output the current version")
  .description("Fetch and display the current weather.")
  .usage("weather --search")
  .action(displayAppInfo);

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
      readFile("./config.env", "utf-8")
        .then((data) => {
          const updatedContent = data.replace(
            /^LOCATION=.+$/m,
            `LOCATION=${answers.location}`
          );
          return writeFile("./config.env", updatedContent);
        })
        .then(() => {
          console.log("Setting default location was successful.");
          process.exit();
        })
        .catch((err) => {
          console.log("Error while setting default location.", err);
          process.exit(1);
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
      readFile("./config.env", "utf-8")
        .then((data) => {
          const updatedContent = data.replace(
            /^UNIT=.+$/m,
            `UNIT=${answers.unit}`
          );
          return writeFile("./config.env", updatedContent);
        })
        .then(() => {
          console.log("Setting default unit was successful.");
          process.exit();
        })
        .catch((err) => {
          console.log("Error while setting default unit.", err);
          process.exit(1);
        });
    });
  });

program
  .command("weather")
  .alias("w")
  .option(
    "-s, --search",
    "Fetch and display the current weather based on the user's input (city or zip code)."
  )
  .description("Fetch and display the current weather.")
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
      console.log("You do not have default location specified.");
    }
  });

program.parse(process.argv);
