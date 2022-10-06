#!/usr/bin/env node

import minimist from "minimist";
import moment from "moment-timezone";
import fetch from "node-fetch";

const args = minimist(process.argv.slice(2));

let timezone = moment.tz.guess();
let latitude = '0';
let longitude = '0';
let timeline = 'tomorrow';

if (args.h) {
    console.log(`
    Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -t TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -t            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.
    `)
}
// declaring variables
if (args.n) {
    latitude = args.n;
}
if (args.s) {
    latitude = "-" + args.s;
}
if (args.e) {
    longitude = args.e;
}
if (args.w) {
    longitude = "-" + args.w;
}
if (args.t) {
    timezone = args.t;
}
const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=' + timezone)
const data = await response.json();

if (args.j) {
    try {
        console.log(data); 
    } catch(err) {
        process.exitCode = 1;
        console.log('exitcode 1');
    } finally {
        process.exitCode = 0;
        console.log('exitcode 0')
    }

}

if (args.d !== undefined) {
    const days = args.d

    if (days == 0) {
        timeline = "today"
    } else if (days > 1 && days <= 6) {
        timeline = "in " + days + " days"
    } else if (days == 1) {
        timeline = "tomorrow"
    } else {
        throw new Error("Day out of range.")
    }
    
}

if ((args.n !== undefined || args.s !== undefined) && (args.e !== undefined || args.w !== undefined)) {
    let days = 1; 
    if (args.d !== undefined) {
        days = args.d;
    }
    
    let precipitation_hours = data.daily.precipitation_hours[days];
    var galosh_statement
    if (precipitation_hours == 0) {
        galosh_statement = "You will not need your galoshes"
    }
    else {
        galosh_statement = "You might need your galoshes"
    }
    let time = data.daily.time[days];
    let temp_high = data.daily.temperature_2m_max[days];
    let temp_high_unit = data.daily_units.temperature_2m_max;
    let temp_low_unit = temp_high_unit;
    let temp_low = data.daily.temperature_2m_min[days];
    let precip_sum = data.daily.precipitation_sum[days];
    let precip_sum_unit = data.daily_units.precipitation_sum;
    let precip_hours = data.daily.precipitation_hours[days];
    let precip_hours_unit = data.daily_units.precipitation_hours;
    let wind_speed = data.daily.windspeed_10m_max[days];
    let wind_speed_unit = data.daily_units.wind_speed_unit;
    let wind_direction = data.daily.winddirection_10m_dominant[days];
    let wind_direction_unit = data.daily_units.winddirection_10m_dominant;
    let wind_gusts = data.daily.windgusts_10m_max[days];
    let wind_gusts_unit = data.daily_units.windgusts_10m_max;
    let weathercode = data.daily.weathercode[days];
    let sunrise = data.daily.sunrise[days].substr(data.daily.sunrise[days].length - 5);
    let sunset = data.daily.sunset[days].substr(data.daily.sunset[days].length - 5);
    let current_time = data.current_weather.time;
    let current_temp = data.current_weather.temperature;
    let current_wind_speed = data.current_weather.windspeed;
    let current_wind_direction = data.current_weather.winddirection;
    let current_weathercode = data.current_weather.weathercode;
    
    console.log("\nIn the timezone " + timezone + ", the weather " + timeline + " at latitude: " + latitude + " and longitude: " +
    longitude + " is as follows.\n");
    console.log("Weather for " + time + ": \n");
    console.log("\n");
    console.log("Forecast for " + time + ":" + "\n");
    console.log("\n");
    console.log("\tHigh: " + temp_high + temp_high_unit + "\tLow: " + temp_low + temp_low_unit + "\n");
    console.log("\tPrecipitation: " + precip_sum + " " + precip_sum_unit + " over " + precip_hours + " " + precip_hours_unit + "\n");
    console.log("\tWind: " + wind_speed + " " + wind_speed_unit + " from " + wind_direction + wind_direction_unit + " with gusts up to " + wind_gusts + " " + wind_gusts_unit + " \n");
    console.log("\tWMO weather code: " + weathercode + "\n");
    console.log("\tSunrise: " + sunrise+ "\n");
    console.log("\tSunset: " + sunset + "\n");
    console.log("\n");
    console.log("Current weather (" + current_time + "):" + "\n");
    console.log("\n");
    console.log("\tTemperature: " + current_temp + temp_high_unit + "\n");
    console.log("\tWind: " + current_wind_speed + " " + wind_speed_unit + " from " + current_wind_direction + wind_direction_unit + "\n");
    console.log("\tWMO weather code: " + current_weathercode + "\n\n");
    console.log(galosh_statement + " " + timeline + ".");
}