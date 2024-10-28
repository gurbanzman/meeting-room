import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import {
  Corpus,
  Equipment,
  Faculty,
  Measure,
  MeasureEquipments,
  RoomAndEquipment,
  Rooms,
  Users,
} from "../base/models/index.js";

dotenv.config();
const app = express();

//   from: "Excited User <mailgun@sandbox4c7756f4e4a746a0bad8b8f91704a354.mailgun.org>",
//   to: ["test@example.com"],
//   subject: "Hello",
//   text: "Testing some Mailgun awesomeness!",
//   html: "<h1>Testing some Mailgun awesomeness!</h1>"
// })
// .then(msg => console.log(msg)) // logs response data
// .catch(err => console.log(err));
async function main(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTPHOST,
    port: process.env.SMTPPORT,
    secure: true,
    auth: {
      user: process.env.MYGMAIL,
      pass: process.env.MYSPECIALPASS,
    },
  });
  const info = await transporter.sendMail({
    from: `Gurbanzada Murad <${process.env.MYGMAIL}>`,
    to: to,
    subject: subject,
    html: html,
  });
  console.log("Message sent: " + info.messageId);
}
app.use(express.json());
app.use(cors());
const mongoURI = process.env.MONGO_MEETING_ROOM;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

// mongoose connection -- db
const db = mongoose.connection;
db.on("error", console.error.bind("MongoDB connection error"));
db.once("open", () => {
  console.log("MongoDB connected!");
});
// connect to MongoDB

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 20000,
  })
  .then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
    console.error("Hata nesnesi:", JSON.stringify(err, null, 2));
  });

// send POST request email
app.post("/send", async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    const sendMail = main(to, subject, html).catch((error) =>
      console.error(error)
    );
    res.json(sendMail);
  } catch (error) {
    console.error(error);
  }
});

// Users data API
app.get("/users", async (req, res) => {
  try {
    const users = await Users.aggregate([
      {
        $lookup: {
          from: "faculties",
          localField: "faculty",
          foreignField: "users",
          as: "faculty",
        },
      },
    ]);
    res.json(users);
  } catch (error) {
    console.error(error);
  }
});
app.post("/users", async (req, res) => {
  try {
    const newUser = await Users.create(req.body);
    res.json(newUser);
  } catch (error) {
    console.error(error);
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const getRooms = await Rooms.find();
    res.json(getRooms);
  } catch (error) {
    console.error(error);
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const getUserById = await Users.findById(id);
    res.json(getUserById);
  } catch (error) {
    console.error(error);
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const getUserById = await Users.findByIdAndDelete(id);
    res.json(getUserById);
  } catch (error) {
    console.error(error);
  }
});

app.post("/rooms", async (req, res) => {
  try {
    const postRooms = new Rooms({
      room_number: req.body.room_number,
      room_seat_counts: req.body.room_seat_counts,
      corpus: req.body.corpus,
    });
    await postRooms.save();
    res.json(postRooms);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/rooms/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateRooms = await Rooms.findByIdAndDelete(_id);
    res.json(updateRooms);
  } catch (error) {
    console.error(error);
  }
});

app.put("/rooms/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await req.body;
    const updateRooms = await Rooms.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    res.json(updateRooms);
  } catch (error) {
    console.error(error);
  }
});

app.get("/faculty", async (req, res) => {
  try {
    const getFaculty = await Faculty.find();
    res.json(getFaculty);
  } catch (error) {
    console.error(error);
  }
});

app.post("/faculty", async (req, res) => {
  try {
    const postFaculty = new Faculty({
      faculty_name: req.body.faculty_name,
    });
    await postFaculty.save();
    res.json(postFaculty);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/faculty/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateFaculty = await Faculty.findByIdAndDelete(_id);
    res.json(updateFaculty);
  } catch (error) {
    console.error(error);
  }
});

app.put("/faculty/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await req.body;
    const updateFaculty = await Faculty.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    res.json(updateFaculty);
  } catch (error) {
    console.error(error);
  }
});

app.get("/corpus", async (req, res) => {
  try {
    const getCorpus = await Corpus.find();
    res.json(getCorpus);
  } catch (error) {
    console.error(error);
  }
});

app.get("/equipment", async (req, res) => {
  try {
    const getEquipment = await Equipment.find();
    res.json(getEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.post("/equipment", async (req, res) => {
  try {
    const postEquipment = new Equipment({
      equipment_name: req.body.equipment_name,
    });
    await postEquipment.save();
    res.json(postEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/equipment/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateEquipment = await Equipment.findByIdAndDelete(_id);
    res.json(updateEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.put("/equipment/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await req.body;
    const updateEquipment = await Equipment.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    res.json(updateEquipment);
  } catch (error) {
    console.error(error);
  }
});
app.get("/roomsAndEquipments", async (req, res) => {
  try {
    const getRoomAndEquipment = await RoomAndEquipment.find();
    res.json(getRoomAndEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.post("/roomsAndEquipments", async (req, res) => {
  try {
    const postRoomAndEquipment = new RoomAndEquipment({
      room: req.body.room,
      equipment: req.body.equipment,
    });
    await postRoomAndEquipment.save();
    res.json(postRoomAndEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.get("/others", async (req, res) => {
  try {
    const getRoomAndEquipment = await MeasureEquipments.find();
    res.json(getRoomAndEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.post("/others", async (req, res) => {
  try {
    const postRoomAndEquipment = new MeasureEquipments({
      measure_equipments: req.body.measure_equipments,
      measures: req.body.measures,
      users_message: req.body.users_message,
    });
    await postRoomAndEquipment.save();
    res.json(postRoomAndEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/others/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const deleteByIdOthers = await MeasureEquipments.findByIdAndDelete(_id);
    res.json(deleteByIdOthers);
  } catch (error) {
    console.error(error);
  }
});

app.delete("/roomsAndEquipments/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateRoomAndEquipment = await RoomAndEquipment.findByIdAndDelete(
      _id
    );
    res.json(updateRoomAndEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.put("/roomsAndEquipments/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await req.body;
    const updateRoomAndEquipment = await RoomAndEquipment.findByIdAndUpdate(
      _id,
      updateData,
      {
        new: true,
      }
    );
    res.json(updateRoomAndEquipment);
  } catch (error) {
    console.error(error);
  }
});

app.post("/admin", (req, res) => {
  if (username === req.body.username && password === req.body.password) {
    return res.json({ message: "Uğurlu Qeydiyyat", success: true });
  } else {
    return res.json({ message: "Uğursuz Qeydiyyat", success: false });
  }
});

app.get("/measure", async (req, res) => {
  try {
    const getMeasure = await Measure.find();
    res.json(getMeasure);
  } catch (error) {
    console.error(error);
  }
});

app.post("/measure", async (req, res) => {
  try {
    const postMeasure = new Measure({
      measure_name: req.body.measure_name,
      measure_start: req.body.measure_start,
      measure_end: req.body.measure_end,
      users: req.body.users,
      room: req.body.room,
      id: req.body.id,
      measure_info: req.body.measure_info,
      status: req.body.status,
    });
    await postMeasure.save();
    res.json(postMeasure);
  } catch (error) {
    console.error(error);
  }
});

app.put("/measure/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await req.body;
    const updateMeasure = await Measure.findByIdAndUpdate(
      _id,
      { $set: updateData },
      {
        new: true,
      }
    );
    res.json(updateMeasure);
  } catch (error) {
    console.error(error);
  }
});

app.get("/admin-measure", async (req, res) => {
  try {
    const getAllMeasure = await Measure.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "users",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "rooms",
        },
      },
    ]);
    res.json(getAllMeasure);
  } catch (error) {
    console.error(error);
  }
});
app.delete("/measure/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const getMeasureById = await Measure.findByIdAndDelete(_id);
    res.json(getMeasureById);
  } catch (error) {
    console.error(error);
  }
});
app.listen(process.env.PORT);
