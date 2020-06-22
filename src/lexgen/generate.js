const fs = require("fs");
const readline = require("readline");

console.log("Generate lexicon files");

const srcFile = "src/lexgen/lexicon/lexicon.htm";
const distDir = "dist/lexicon/";
const distFile = `${distDir}index.html`;

const date = new Date().toISOString();

let inPre = false;

processLineByLine();

async function processLineByLine() {
  const fileInStream = fs.createReadStream(srcFile);
  const indexOutStream = fs.createWriteStream(distFile, { flags: "w" });
  let patternOutStream = null;
  let name = "";
  let fileName = "";
  let pattern = "";
  let description = "";

  const rl = readline.createInterface({
    input: fileInStream,
  });

  for await (const line of rl) {
    const nameMatches = line.match(/<p>:<a name=[^>]+><b>([^<]+)<\/b>/);
    if (nameMatches) {
      if (pattern != "") {
        const patternData = {
          name,
          date,
          description,
          pattern,
        };
        patternOutStream = fs.createWriteStream(
          `${distDir}data/${fileName}.json`,
          { flags: "w" }
        );
        patternOutStream.write(JSON.stringify(patternData));
        patternOutStream.end();
        pattern = "";
        description = "";
      }

      name = nameMatches[1];
      fileName = name.replace(" ", "_").replace("/", ";");
      console.log(`Pattern: ${name}`);
    }

    if (line == "</pre>") {
      inPre = false;
    }

    if (inPre) {
      const patternMatches = line.match(/^	([O.]+)$/);

      if (patternMatches) {
        console.log(`Line from file: ${patternMatches[1]}`);
        pattern = `${pattern}${patternMatches[1]}\n`;
      }
    } else {
      description = `${description}${line}\n`;
    }

    if (line == "<pre>") {
      inPre = true;
    }

    indexOutStream.write(`${line}\n`);
  }
  indexOutStream.end();
}

function writeData(filename, data) {}
