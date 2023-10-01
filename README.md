# Weather CLI App

![weather-cli-app](https://i.imgur.com/rFfHrWq.png)

This Weather CLI App fetches weather data and displays it to the user. It allows users to retrieve current weather information based on a provided city name or zip code.

## Features

- Fetches weather data based on user input (city name or zip code).
- Displays the current weather, including temperature and other relevant information.
- Supports temperature units in both Celsius (°C) and Fahrenheit (°F).
- Allows users to set a default location for quicker weather checks.
- Enables users to set default temperature units (Celsius or Fahrenheit) for displaying.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/weather-cli-app.git
cd weather-cli-app
```

2. Install dependencies:

```bash
npm install
```

## Usage

To use the Weather CLI App, run the following command in the terminal:

```bash
weather-cli [command] [options]
```

Replace [command] with the desired action (e.g., weather, set-location, set-units) and [options] with any applicable options for the chosen command.

For example, to fetch and display the current weather for a specific location, use:

```bash
weather-cli weather -s
```

## Commands

- weather (alias: w): Fetch and display the current weather.
- set-location (alias: sl): Allow users to set a default location.
- set-units (alias: su): Allow users to set default temperature units.
