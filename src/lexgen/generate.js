const fs = require("fs");
const readline = require("readline");
const { encode } = require("html-entities");
const sanitize = require("sanitize-filename");
const mkdirp = require("mkdirp");
const { createCanvas } = require("canvas");

main();

async function main() {
  console.log("Generate lexicon files");

  const { stripHtml } = await import("string-strip-html");

  await mkdirp("dist/lexicon/html");
  await mkdirp("dist/lexicon/data");
  await mkdirp("dist/lexicon/pix");

  const srcFile = "src/lexgen/lexicon/lexicon.htm";
  const lexiconDir = "dist/lexicon/";
  const distFile = "dist/list.html";

  const now = new Date();
  const date = now.toISOString();
  const date822 = now.toUTCString();

  const patternPlaceholder = "<!-- pattern -->";
  const termState = 2;
  const patternState = 3;

  let state = termState;
  let data = {};
  // const entities = new Entities();

  fs.readFile("src/lexgen/template.html", "utf8", (err, template) => {
    if (err) throw err;

    writePage(`dist/index.html`, template, {
      title: "Play John Conway’s Game of Life",
      url: "https://playgameoflife.com/",
      name: "glider",
      nameCase: "Loading…",
      term: "",
      date,
      description:
        "Play the Game of Life online, a single player game invented in 1970 by Cambridge mathematician John Conway.",
      info: "Loading full Life Lexicon…",
      saveName: "index",
      pattern: ".O.\n..O\nOOO\n",
      image: "https://playgameoflife.com/pix/screen.png",
      twitterImage: "https://playgameoflife.com/pix/screen2-1.png",
    });

    parse(template, 7);
  });

  async function parse(template, count) {
    const fileInStream = fs.createReadStream(srcFile);
    const indexOutStream = fs.createWriteStream(distFile, { flags: "w" });
    const rss = new Rss("dist/list.rss");
    rss.writeRssHeader();
    let pattern = "";

    const rl = readline.createInterface({ input: fileInStream });

    forall: for await (let line of rl) {
      switch (state) {
        case termState:
          // Possible lines to match:
          // <p>:<a name=nxn><b>0hd Demonoid</b>
          // <p><a name=Y>:</a><b>Y-pentomino</b> Co
          // <p><a name=Z>:</a><a name=wss><b>zebra stripes
          // <p>:<b>tumbling T-tetson</b> (p8)
          const newPatternMatches =
            line.match(/<p>:?<a name=([^>]+)>:?/) || line.match(/<p>:/);

          if (newPatternMatches) {
            // save previous data
            await saveAll(indexOutStream, template, data, rss);

            const code = newPatternMatches[1] || "";

            let name = "";
            let meta = "";
            let metaMatches = "";
            const nameMatches = line.match(/<b>([^<]+)<\/b>\S*\s(.*)/);

            if (nameMatches) {
              name = nameMatches[1];
              line = nameMatches[2];
            }

            // breaks at long long snake?
            metaMatches = line.match(/\(([^=]+)\) ?(.*)/);

            if (metaMatches) {
              meta = metaMatches[1];
              line = metaMatches[2];
            }

            // start new data
            data = {
              code,
              name,
              meta,
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

    await saveAll(indexOutStream, template, data, rss);

    rss.writeRssFooter();
    fileInStream.close();
    indexOutStream.end();
  }

  async function saveAll(outStream, template, data, rss) {
    if (!data.name) {
      return;
    }

    if (data.patterns.length > 0) {
      for (patternIndex in data.patterns) {
        const filename = saveFileName(data, patternIndex);

        const imageData = await writeImage(
          filename,
          data.patterns[patternIndex]
        );

        data.description = data.description.replace(
          patternPlaceholder,
          `<p class="image"><a data-internal href="/lexicon/${filename}"><img src="/lexicon/${imageData.filePath}" width="${imageData.width}" height="${imageData.height}" loading="lazy" alt="Game of Life pattern ’${filename}’"></a></p>\n`
        );

        writeData(filename, data, patternIndex);

        writePage(`${lexiconDir}html/${filename}.html`, template, {
          title: `${titleCase(data.name)} - John Conway’s Game of Life`,
          url: `https://playgameoflife.com/lexicon/${filename}`,
          code: data.code,
          name: data.name,
          nameCase: titleCase(data.name),
          date,
          description: encode(stripHtml(data.description).result),
          info: data.description,
          saveName: filename,
          term: saveFileName(data, 0),
          pattern: data.patterns[patternIndex],
          image: `https://playgameoflife.com/lexicon/pix/${filename}.png`,
          twitterImage: `https://playgameoflife.com/lexicon/pix/${filename}.png`,
        });

        rss.writeRssItem(data, imageData, filename);
      }
    }

    outStream.write(
      `<section id="${data.code}" data-term="${saveFileName(data, 0)}">
          <h2>${data.name}</h2>
          <div class="meta">${data.meta}</div>
          <p>${data.description}</p>
      </section>\n`
    );
  }

  function writePage(file, out, data) {
    for (item in data) {
      out = out.replace(new RegExp(`{{${item}}}`, "g"), data[item]);
    }

    fs.writeFile(file, out, "utf8", (err) => {
      if (err) throw err;
    });
  }

  function writeData(fileName, data, pattern) {
    data = { ...data };
    data.pattern = data.patterns[pattern];
    delete data.patterns;

    const patternOutStream = fs.createWriteStream(
      `${lexiconDir}data/${fileName}.json`,
      { flags: "w" }
    );
    patternOutStream.write(JSON.stringify(data));
    patternOutStream.close();
  }

  async function writeImage(fileName, pattern) {
    const lines = pattern.split(/\n/);

    const cellSize = 11;
    const padding = 10;
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
      ctx.moveTo(x * cellSize + padding - 0.5, padding);
      ctx.lineTo(x * cellSize + padding - 0.5, cellSize * rows + padding);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(padding - 1, y * cellSize + padding - 0.5);
      ctx.lineTo(cellSize * cols + padding, y * cellSize + padding - 0.5);
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
    const filePath = `${lexiconDir}${localPath}`;
    const imageOutStream = fs.createWriteStream(filePath, { flags: "w" });
    const pngStream = canvas.createPNGStream();
    let size = 0;
    pngStream
      .on("data", function (chunk) {
        size += chunk.length;
      })
      .pipe(imageOutStream);

    await new Promise((resolve) => {
      pngStream.on("end", resolve);
    });

    return {
      filePath: localPath,
      width: canvas.width,
      height: canvas.height,
      size,
    };
  }

  function saveFileName(data, i) {
    return saveString(
      data.patterns.length == 1 ? data.name : `${data.name}_(${Number(i) + 1})`
    );
  }

  function saveString(str) {
    return sanitize(
      str.replace(/ /g, "_").replace(/'/g, "").replace(/\//g, ";")
    );
  }

  function titleCase(str) {
    return `${str[0].toUpperCase()}${str.substr(1)}`;
  }

  class Rss {
    constructor(path) {
      this.stream = fs.createWriteStream(path, { flags: "w" });
    }

    writeRssHeader() {
      this.stream.write(
        `<?xml version="1.0" encoding="utf-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel> 
    <title>John Conway’s Game of Life</title>
    <description>Play John Conway’s Game of Life in your browser</description>
    <link>https://playgameoflife.com/</link>
    <language>en-us</language>
    <webMaster>edwin@bitstorm.org (Edwin Martin)</webMaster>
    <atom:link href="https://playgameoflife.com/list.rss" rel="self" type="application/rss+xml" />
`,
        "utf8"
      );
    }

    writeRssItem(data, imageData, filename) {
      this.stream.write(
        `
    <item>
      <title>${titleCase(data.name)} - John Conway’s Game of Life</title>
      <link>https://playgameoflife.com/lexicon/${filename}</link>
      <description>${stripHtml(data.description)
        .result.replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')}</description>
      <enclosure url="https://playgameoflife.com/lexicon/pix/${filename}.png" length="${
          imageData.size
        }" type="image/png" />
      <pubDate>${date822}</pubDate>
      <guid isPermaLink="true">https://playgameoflife.com/lexicon/${filename}</guid>
    </item>
`,
        "utf8"
      );
    }

    writeRssFooter() {
      this.stream.write("\t</channel>\n</rss>\n");
    }
  }
}
