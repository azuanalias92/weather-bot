import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Your API tokens
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN as string;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY as string;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

// Matches "/weather [city]"
bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match ? match[1] : '';

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const weatherDescription = data.weather[0].description;
        const temperature = data.main.temp;

        bot.sendMessage(
            chatId,
            `Weather in ${city}:\n${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}\nTemperature: ${temperature}°C`
        );
    } catch (error) {
        bot.sendMessage(chatId, 'City not found. Please try again.');
    }
});

// Matches "/start"
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello! I am a Weather Bot. Send /weather <city> to get the weather update.');
});
