import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_surname: {
      type: String,
      required: true,
    },
    user_phone: {
      type: String,
    },
    user_mail: {
      type: String,
    },
    user_message: {
      type: String,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
  },
  { timestamps: true }
);

const FacultySchema = new mongoose.Schema(
  {
    faculty_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const RoomSchema = new mongoose.Schema(
  {
    room_number: {
      type: String,
      required: true,
    },
    room_seat_counts: {
      type: Number,
      required: true,
    },
    corpus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corpus",
    },
  },
  { timestamps: true }
);

const CorpusSchema = new mongoose.Schema(
  {
    corpus_name: {
      type: String,
    },
  },
  { timestamps: true }
);

const EquipmentSchema = new mongoose.Schema(
  {
    equipment_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const RoomAndEquipmentSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rooms",
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },
  },
  { timestamps: true }
);

const MeasureSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    measure_name: {
      type: String,
      required: true,
    },
    measure_info: {
      type: String,
      required: true,
    },
    measure_start: {
      type: Date,
    },
    measure_end: {
      type: Date,
    },
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rooms",
    },
    status: {
      type: Boolean
    }
  },
  { timestamps: true }
);

const Other = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rooms",
  },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

const MeasureWithEquipments = new mongoose.Schema({
  measure_equipments: [
    {
      type: String,
    },
  ],
  measures: {
    type: String,
    ref: "Measure",
  },
  users_message: {
    type: String,
  },
});

export const Users =
  mongoose.model("Users", UserSchema) || mongoose.models("Users");
export const Faculty =
  mongoose.model("Faculty", FacultySchema) || mongoose.models("Faculty");
export const Measure =
  mongoose.model("Measure", MeasureSchema) || mongoose.models("Measure");
export const Rooms =
  mongoose.model("Rooms", RoomSchema) || mongoose.models("Rooms");
export const Corpus =
  mongoose.model("Corpus", CorpusSchema) || mongoose.models("Corpus");
export const Equipment =
  mongoose.model("Equipment", EquipmentSchema) || mongoose.models("Equipment");
export const RoomAndEquipment =
  mongoose.model("RoomAndEquipment", RoomAndEquipmentSchema) ||
  mongoose.models("RoomAndEquipment");
export const Others =
  mongoose.model("Other", Other) || mongoose.models("Other");
export const MeasureEquipments =
  mongoose.model("MeasureWithEquipments", MeasureWithEquipments) ||
  mongoose.models("MeasureWithEquipments");
