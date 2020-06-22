const fs = require("fs");
const readline = require("readline");
const { createCanvas } = require("canvas");

console.log("Generate lexicon files");

const srcFile = "src/lexgen/lexicon/lexicon.htm";
const distDir = "dist/lexicon/";
const distFile = `${distDir}index.html`;

const date = new Date().toISOString();

let inPre = false;

parse();

async function parse() {
  const fileInStream = fs.createReadStream(srcFile);
  const indexOutStream = fs.createWriteStream(distFile, { flags: "w" });
  let name = "";
  let fileName = "";
  let uniqueFileName = "";
  let oldFileName = "";
  let fileNameCount = 1;
  let pattern = "";
  let description = "";

  const rl = readline.createInterface({ input: fileInStream });

  for await (let line of rl) {
    const nameMatches = line.match(/<p>:(<a name=[^>]+>)?<b>([^<]+)<\/b>/);
    if (nameMatches) {
      if (pattern != "") {
        writeData(fileName, {
          name,
          date,
          description,
          pattern,
        });

        description = "";
      }

      name = nameMatches[2];
      fileName = name.replace(" ", "_").replace("'", "").replace("/", ";");

      console.log(`\nPattern: ${name}`);
    }

    if (line == "</pre>") {
      if (fileName == oldFileName) {
        uniqueFileName = `${fileName}-${fileNameCount++}`;
      } else {
        uniqueFileName = fileName;
        fileNameCount = 1;
      }
      oldFileName = fileName;

      const imageData = writeImage(uniqueFileName, pattern);
      indexOutStream.write(`${line}\n`);
      line = `<p><a href='#${fileName}'><img src='${imageData.filePath}' width='${imageData.width}' height='${imageData.height}'></a></p>\n`;
      inPre = false;
      pattern = "";
    }

    if (inPre) {
      const patternMatches = line.match(/^	([O.]+)$/);

      if (patternMatches) {
        console.log(patternMatches[1]);
        pattern = `${pattern}${patternMatches[1]}\n`;
      }
    } else {
      description = `${description}${line}\n`;
    }

    if (line == "<pre>") {
      inPre = true;
    }

    if (!inPre) {
      indexOutStream.write(`${line}\n`);
    }
  }
  fileInStream.close();
  indexOutStream.end();
}

function writeData(fileName, data) {
  const patternOutStream = fs.createWriteStream(
    `${distDir}data/${fileName}.json`,
    { flags: "w" }
  );
  patternOutStream.write(JSON.stringify(data));
  patternOutStream.close();
}

function writeImage(fileName, pattern) {
  const lines = pattern.split(/\n/);

  const cellSize = 11;
  const padding = 5;
  const cols = lines[0].length;
  const rows = lines.length - 1;

  const canvas = createCanvas(
    cols * cellSize + 2 * padding,
    rows * cellSize + 2 * padding
  );
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#7e7e7e";
  ctx.fillRect(
    0,
    0,
    cols * cellSize + 2 * padding,
    rows * cellSize + 2 * padding
  );

  ctx.strokeStyle = "#999";
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize - 1 + padding, padding);
    ctx.lineTo(x * cellSize - 1 + padding, cellSize * rows - 1 + padding);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(padding, y * cellSize - 1 + padding);
    ctx.lineTo(cellSize * cols - 1 + padding, y * cellSize - 1 + padding);
    ctx.stroke();
  }

  ctx.fillStyle = "yellow";
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] == "O") {
        ctx.fillRect(
          x * cellSize + padding,
          y * cellSize + padding,
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  }

  const localPath = `pix/${fileName}.png`;
  const filePath = `${distDir}${localPath}`;
  const imageOutStream = fs.createWriteStream(filePath, { flags: "w" });
  const stream = canvas.createPNGStream();
  stream.pipe(imageOutStream);

  return { filePath: localPath, width: canvas.width, height: canvas.height };
}
