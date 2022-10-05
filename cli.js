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
        galosh_statement = "You will not need your galoshes."
    }
    else {
        galosh_statement = "You might need your galoshes."
    }
    
    console.log("In the timezone " + timezone + ", the weather " + timeline + " at latitude: " + latitude + " and longitude: " +
    longitude + " is as follows.\nThe temperature high is " + data.daily.temperature_2m_max[days] + " and low is " + data.daily.temperature_2m_min[days] + " degrees fahrenheit. The max windspeed is " +
    data.daily.windspeed_10m_max[days] + " mph. There are " + data.daily.precipitation_hours[days] + " hours of rain.\n*****" + galosh_statement + "*****\nSunrise is at " + data.daily.sunrise[days].substr(data.daily.sunrise[days].length - 5)
    + " and sunset is at " + data.daily.sunset[days].substr(data.daily.sunset[days].length - 5) + " given the previously noted timezone.")
}