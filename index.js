const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require('mongoose');

const mongoDBURL = 'mongodb+srv://casinohack:41155qweasdzxc@cluster0.afkand9.mongodb.net/bots-clients';

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Подключено к MongoDB Atlas'))
    .catch((err) => console.error('Ошибка при подключении к MongoDB Atlas:', err));

const TOKEN = "2132598511:AAH4ERYL4gVJ3YI4TpsBT6ZL05ubAEH2h0g";
const game1Name = "Rocket_Queen";
const game2Name = "jaja_lucky";
const game3Name = "hack";


const userSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        unique: true
    },
    username: String,
    firstName: String,
    lastName: String,
    languageCode: String,
    isBot: Boolean
});

const User = mongoose.model('User', userSchema, 'bot-ru');

const buttonTitle = "Получить прогноз"; 
const welcomePhoto = "https://play-lh.googleusercontent.com/W-xMaa2x_2fJGBA8qC3rm9anD_6o8IJ9_ttkFrzy7Y8NAZtAyuAuRM62mq_SwAs2D-cY";
const game1Url = "http://cryplink-1.site/";


const queries = {};

const server = express();
const bot = new TelegramBot(TOKEN, {
    polling: true
});

server.use(express.static(path.join(__dirname, "Lucky_Jet")));

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name;
    const languageCode = msg.from.language_code;
    const isBot = msg.from.is_bot;


    let existingUser;  

    try {
        existingUser = await User.findOne({ chatId: chatId });
    } catch (error) {
        console.error('Ошибка при выполнении запроса к базе данных:', error);
    }

    if (!existingUser) {
        const newUser = new User({
            chatId: chatId,
            username: username,
            firstName: firstName,
            lastName: lastName,
            languageCode: languageCode,
            isBot: isBot
        });
        await newUser.save();
        
    } else {
       
    }
    const welcomeMessage = "Для работоспособности (подключения) данного бота писать ➡️ @casinohack_ivan";
    const replyMarkup = {
        inline_keyboard: [
            [
                { text: "Список игр 🎰", callback_data: "game_list"}
        
            ],
            /* [
                { text: "Поддержка 🆘", callback_data: "instruction" }
            ] */
        ]
    };

    bot.sendPhoto(chatId, welcomePhoto, {
        caption: welcomeMessage,
        reply_markup: JSON.stringify(replyMarkup)
    });
});

// Обработка callback query
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "game_list") {
        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: "Rocket Queen 🆕", callback_data: "Rocket_Queen" },
                    { text: "Lucky Jet", callback_data: "Lucky_Jet" },
                    { text: "Aviator", callback_data: "Aviator" }
                ]
            ]
        };

        bot.sendMessage(chatId, "Выберите необходимую игру:", {
            reply_markup: JSON.stringify(replyMarkup)
        });
    } else if (query.data === "Aviator" || query.data === "Rocket_Queen" || query.data === "Lucky_Jet") {
        if (query.data === "Rocket_Queen") {
            let gameName = game1Name; 
            const replyMarkup = {
                inline_keyboard: [[
                    { text: buttonTitle, callback_game: { gameName } }
                ]]
            };

            bot.sendGame(chatId, gameName, {
                reply_markup: JSON.stringify(replyMarkup)
            });
        } else {
            let messageText;
            let buttonText;
            let gameUrl;
            let photoUrl; 

            if (query.data === "Aviator") {
                messageText = "Прогнозы исхода игры Aviator ✈️ до 50x 🔥";
                buttonText = "Получить прогноз";
                gameUrl = "https://tonslot.com/";
                photoUrl = "https://i.ibb.co/1d55gKv/Group-120.png"; 
            } else if (query.data === "Lucky_Jet") {
                messageText = "Прогнозы исхода игры Lucky Jet 🎰 до 50x 🔥";
                buttonText = "Получить прогноз";
                gameUrl = "https://tonslot.site/";
                photoUrl = "https://poltronanerd.com.br/wp-content/uploads/2023/04/lucky.webp";
            }

            const replyMarkup = {
                inline_keyboard: [
                    [
                        {
                            text: buttonText,
                            web_app: { url: gameUrl }
                        }
                    ]
                ]
            };

            bot.sendPhoto(chatId, photoUrl, {
                caption: messageText,
                reply_markup: JSON.stringify(replyMarkup)
            });

            bot.answerCallbackQuery({
                callback_query_id: query.id,
                url: gameUrl
            });
        }
       
    }
    bot.answerCallbackQuery({
        callback_query_id: query.id,
        url: game1Url
    });
});


