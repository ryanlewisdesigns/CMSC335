const mongoose = require("mongoose");

const printerSchema = new mongoose.Schema({
  nickname: String,
  brand: String,
  model: String,
  trayMaxVolume: Number,
  backgroundinfo: String,
  submissionDate: { type: Date, default: Date.now }
}, {collection: 'Printers'});

const Printer = mongoose.model("Printer", printerSchema);

module.exports = Printer;
