import fs from "fs";
import * as mammoth from "mammoth";

async function run() {
  try {
    const buffer = fs.readFileSync("fake-syllabus.txt"); // Actually wait, I need a .docx file to test mammoth.
    console.log("Mammoth loaded!");
  } catch(e) {
    console.error(e);
  }
}
run();
