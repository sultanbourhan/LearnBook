const express = require("express");
const {
  addMessageToChat,
  getChatBetweenUsers,
  uploadFileMiddleware // 👈 تأكد أنك تصدّره من نفس الملف
} = require("../services/chat_Servicrs");

const { check_login, check_user_role } = require("../services/authServicrs");

const chat_routes = express.Router();

// 🛠️ تعديل هنا: إضافة Middleware رفع الملفات
chat_routes
  .route("/")
  .post(check_login, uploadFileMiddleware, addMessageToChat);

chat_routes
  .route("/:user1Id/:user2Id")
  .get(check_login, getChatBetweenUsers);

module.exports = chat_routes;
