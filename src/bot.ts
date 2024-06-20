import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

dotenv.config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN as string;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY as string;

const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

async function getWeatherData(url: string) {
    try {
        const response = await axios.get(url);
        const data = response.data;
        const weatherDescription = data.weather[0].description;
        const temperature = data.main.temp;
        return `Weather:\n${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}\nTemperature: ${temperature}°C`;
    } catch (error) {
        return 'Location not found. Please try again.';
    }
}

bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match ? match[1] : '';
    
    let url: string;

    if (input.includes(',')) {
        const [lat, lon] = input.split(',').map(coord => coord.trim());
        url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    } else {
        const city = input;
        url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
    }

    const weatherMessage = await getWeatherData(url);
    bot.sendMessage(chatId, weatherMessage);
});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello! I am a Weather Bot. Send /weather <city> or /weather <latitude,longitude> to get the weather update.');
});
