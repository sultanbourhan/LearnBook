const SimpleChatModel = require("../models/chat_Models");

const ApiError = require("../ApiError");

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // تأكد أن المجلد موجود
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

exports.uploadFileMiddleware = upload.array("files", 10); // يدعم رفع حتى 10 ملفات بنفس الوقت


exports.addMessageToChat = asyncHandler(async (req, res, next) => {
  const { user1Id, user2Id, content } = req.body;
  const senderId = req.user._id;

  const newMessage = {
    sender: senderId,
    content: content || "",
    files: [],
  };

if (req.files && req.files.length > 0) {
  const uploadedFiles = req.files.map(file => ({
    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    name: file.originalname,
    type: file.mimetype
  }));

  
  // ❌ لا تعمل stringify ولا تغلفه بمصفوفة جديدة
  newMessage.files = uploadedFiles;
}

  let chat = await SimpleChatModel.findOne({
    $or: [
      { user1: user1Id, user2: user2Id },
      { user1: user2Id, user2: user1Id },
    ],
  });

  if (!chat) {
    chat = await SimpleChatModel.create({
      user1: user1Id,
      user2: user2Id,
      messages: [newMessage],
    });

    return res.status(201).json({ message: "Chat created and message sent", chat });
  }

  chat.messages.push(newMessage);
  await chat.save();

  res.status(200).json({ message: "Message added", chat });
});



// exports.addMessageToChat = asyncHandler(async (req, res, next) => {
//     const { user1Id, user2Id, content } = req.body;
//     const senderId = req.user._id; // تصحيح الإملاء وإزالة الفاصلة

//     // البحث عن محادثة بين المستخدمين
//     let chat = await SimpleChatModel.findOne({
//         $or: [
//             { user1: user1Id, user2: user2Id },
//             { user1: user2Id, user2: user1Id }
//         ]
//     });

//     if (!chat) {
//         // إذا لم يتم العثور على محادثة، يتم إنشاؤها
//         chat = await SimpleChatModel.create({
//             user1: user1Id,
//             user2: user2Id,
//             messages: [
//                 {
//                     sender: senderId,
//                     content: content
//                 }
//             ]
//         });

//         return res.status(200).json({ message: "Chat created successfully", chat });
//     }

//     // إذا كانت المحادثة موجودة، يتم إضافة الرسالة إليها
//     chat.messages.push({
//         sender: senderId,
//         content: content
//     });

//     await chat.save();

//     res.status(200).json({ message: "Message added successfully", chat });
// });



exports.getChatBetweenUsers = asyncHandler(async (req, res, next) => {
    const { user1Id, user2Id } = req.params;

    // البحث عن المحادثة بين الشخصين بغض النظر عن ترتيب الـ IDs
    const chat = await SimpleChatModel.findOne({
        $or: [
            { user1: user1Id, user2: user2Id }, // البحث إذا كان المستخدم الأول هو user1 والمستخدم الثاني هو user2
            { user1: user2Id, user2: user1Id }  // البحث إذا كان المستخدم الأول هو user2 والمستخدم الثاني هو user1
        ]
    })
    .populate("user1", "name") // جلب اسم المستخدم الأول
    .populate("user2", "name") // جلب اسم المستخدم الثاني
    .populate("messages.sender", "name"); // جلب اسم المرسل لكل رسالة

    if (!chat) {
        return res.status(404).json({ message: "Chat not found between these users" });
    }

    res.status(200).json({ data: chat });
});
