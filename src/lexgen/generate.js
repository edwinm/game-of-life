const fs = require("fs");
const readline = require("readline");
const stripHtml = require("string-strip-html");
const Entities = require("html-entities").AllHtmlEntities;
const sanitize = require("sanitize-filename");
const { createCanvas } = require("canvas");

console.log("Generate lexicon files");

const srcFile = "src/lexgen/lexicon/lexicon.htm";
const distDir = "dist/lexicon/";
const distFile = `${distDir}index.html`;

const date = new Date().toISOString();

const patternPlaceholder = "<!-- pattern -->";
const termState = 2;
const patternState = 3;

let state = termState;
let data = {};
const entities = new Entities();

fs.readFile("src/lexgen/template.html", "utf8", (err, template) => {
  if (err) throw err;

  writePage(`${distDir}html/lex.html`, template, {
    title: "Play John Conway’s Game of Life",
    url: "https://playgameoflife.com/",
    name: "",
    date,
    description: "Play John Conway’s Game of Life in your browser.",
    info: "Example patterns…",
    saveName: "index",
    pattern: ".O.\n..O\nOOO\n",
    image: "https://playgameoflife.com/pix/share.png",
  });

  parse(template, 10);
});

async function parse(template, count) {
  const fileInStream = fs.createReadStream(srcFile);
  const indexOutStream = fs.createWriteStream(distFile, { flags: "w" });
  let pattern = "";

  const rl = readline.createInterface({ input: fileInStream });

  for await (let line of rl) {
    switch (state) {
      case termState:
        // Possible lines to match:
        // <p>:<a name=nxn><b>0hd Demonoid</b>
        // <p><a name=Y>:</a><b>Y-pentomino</b> Co
        // <p><a name=Z>:</a><a name=wss><b>zebra stripes
        // <p>:<b>tumbling T-tetson</b> (p8)
        const newPatternMatches =
          line.match(/<p>:/) || line.match(/<p><a name=[^>]+>:/);

        if (newPatternMatches) {
          // save current data
          saveAll(indexOutStream, template, data);
          // if (count-- <= 0) {
          //   return;
          // }

          const nameMatches = line.match(/<b>([^<]+)<\/b>/);
          // start new data
          data = {
            name: nameMatches[1],
            date,
            description: "",
            patterns: [],
          };
        }

        if (line == "<pre>") {
          state = patternState;
        } else {
          data.description += `${line}\n`;
        }
        break;

      case patternState:
        if (line == "</pre>") {
          data.patterns.push(pattern);
          data.description += `${patternPlaceholder}\n`;
          pattern = "";
          state = termState;
        } else {
          const patternMatches = line.match(/^	([O.]+)$/);

          if (patternMatches) {
            pattern += `${patternMatches[1]}\n`;
          } else {
            // track back
            data.description += `<pre>\n${line}\n`;
            state = termState;
          }
        }
        break;
    }
  }

  fileInStream.close();
  indexOutStream.end();
}

function saveAll(outStream, template, data) {
  if (!data.name) {
    return;
  }

  if (data.patterns.length > 0) {
    for (patternIndex in data.patterns) {
      const filename = saveFileName(data, patternIndex);

      const imageData = writeImage(filename, data.patterns[patternIndex]);

      data.description = data.description.replace(
        patternPlaceholder,
        `<p><a href='/lexicon/${filename}'><img src='${imageData.filePath}' width='${imageData.width}' height='${imageData.height}'></a></p>\n`
      );
    }

    for (patternIndex in data.patterns) {
      const filename = saveFileName(data, patternIndex);

      writeData(filename, data, patternIndex);

      writePage(`${distDir}html/${filename}.html`, template, {
        title: `${titleCase(data.name)} - John Conway’s Game of Life`,
        url: `https://playgameoflife.com/lexicon/${filename}`,
        name: data.name,
        date,
        description: entities.encode(stripHtml(data.description)),
        info: data.description,
        saveName: filename,
        pattern: data.patterns[patternIndex],
        image: `https://playgameoflife.com/lexicon/pix/${filename}.png`,
      });
    }
  }

  outStream.write(`<section>${data.description}</section>\n`);
}

function writePage(file, out, data) {
  for (item in data) {
    out = out.replace(new RegExp(`{{${item}}}`, "g"), data[item]);
  }

  fs.writeFile(file, out, "utf8", (err, data) => {
    if (err) throw err;
  });
}

function writeData(fileName, data, pattern) {
  data = { ...data };
  data.pattern = data.patterns[pattern];
  delete data.patterns;

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
  canvas.createPNGStream().pipe(imageOutStream);

  return { filePath: localPath, width: canvas.width, height: canvas.height };
}

function saveFileName(data, i) {
  return saveString(
    data.patterns.length == 1 ? data.name : `${data.name}_(${Number(i) + 1})`
  );
}

function saveString(str) {
  return sanitize(str.replace(/ /g, "_").replace(/'/g, "").replace(/\//g, ";"));
}

function titleCase(str) {
  return `${str[0].toUpperCase()}${str.substr(1)}`;
}
