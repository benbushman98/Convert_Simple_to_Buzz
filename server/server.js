const express = require('express')
const multer = require('multer');
const app = express()
const cors = require('cors');
const { JSDOM } = require('jsdom');
const path = require('path');

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3002; //Line 3
app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get('/api/download/:fileName', (req, res) => {
    console.log('Reached /api/download/:fileName route');
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'converts', fileName); // Adjust the directory path as needed
    res.download(filePath, (err) => {
        if (err) {
            // Handle any errors that occur during the download
            console.error('File download failed:', err);
            res.status(500).send('File download failed');
        }
    });
});
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, ''); // Define the destination folder for uploaded files
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname); // Use the original filename for the uploaded file
    }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log("File Upload Hit")
    const uploadedFile = req.file; // Access the uploaded file
    if (uploadedFile) {
        const fs = require('fs');
        const readline = require('readline');

        async function processFile(inputFile) {
            console.log(inputFile)
            const fileStream = fs.createReadStream(inputFile);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            const outputFile = inputFile.replace(/\.txt$/, '_Buzz.txt');
            let outputData = [];
            let probNum = null;
            let buffer = [];
            let hasQ = false;
            let endHTML = false;
            let starCnt = 0;
            let ft = false;
            let cnt1 = 0;
            let c = false;
            let o = false;
            let fh = false;

            for await (const line of rl) {
                if (isNumber(line)) {
                    probNum = parseInt(line, 10);
                    outputData.push(`Meta-le-name: Question ${probNum}`);
                    if (starCnt > 1) {
                        changeLastMCtoMA(outputData);
                    }
                    starCnt = 0;
                    endHTML = false;
                    cnt1 = 0;

                } else if (line.startsWith("Type:")) {
                    const type = line.split(':')[1].trim();

                    switch (type) {
                        case "MC":
                            hasQ = true;
                            outputData.push("Type: MC");
                            outputData.push("Meta-le-display: MultipleChoice");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "F":
                            hasQ = true;
                            outputData.push("Type: F, IgnoreCase");
                            outputData.push("Meta-le-display: DialogCard");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "MT":
                            outputData.push("Type: MT");
                            outputData.push("Meta-le-display: MatchTextImage");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "WA":
                            outputData.push("Type: MT");
                            outputData.push("Meta-le-display: MatchLocation");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "MA":
                            outputData.push("Type: MT");
                            outputData.push("Meta-le-display: MarkWords");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Options: MaintainOrder");
                            outputData.push("Custom: MarkWords");
                            outputData.push("Meta-le-automark: true");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "TF":
                            hasQ = true;
                            ft = true;
                            outputData.push("Type: MC");
                            outputData.push("Meta-le-display: MultipleChoice");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Options: MaintainOrder");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "O":
                            o = true;
                            outputData.push("Type: O");
                            outputData.push("Meta-le-display: Ordering");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "FB":
                            outputData.push("Type: MT");
                            outputData.push("Meta-le-display: MatchBlank");
                            outputData.push("Options: Inline, DragAndDrop, RemoveUsedChoices");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "FH":
                            fh = true;
                            outputData.push("Type: MA");
                            outputData.push("Meta-le-display: Hotspot");
                            outputData.push("Meta-le-time: 30");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        case "C":
                            c = true;
                            outputData.push("Type: C");
                            outputData.push("Meta-le-display: MemoryCards");
                            outputData.push("Meta-le-time: 90");
                            outputData.push("Meta-le-scope: academic");
                            outputData.push("Groups: academic");
                            break;
                        default:
                            outputData.push(line);
                    }
                } else if (line.startsWith("Target-type:")) {
                    const target = line.split(':')[1].trim();
                    outputData.push(`Meta-le-target-type: ${target}`);

                } else if (line.startsWith("Source-type:")) {
                    const source = line.split(':')[1].trim();
                    outputData.push(`Meta-le-source-type: ${source}`);

                } else if (line.startsWith("Instructions:")) {
                    const instructions = line.split(':')[1].trim();
                    outputData.push(`${probNum}) [HTML]<div class="instructions" style="font-family: 'Nunito Sans';font-style: normal;font-weight: 700;font-size: 20px;line-height: 27px;color: #5A75FF;">${instructions}</div>`);

                } else {
                    if (line.startsWith("Text:")) {
                        const quesText = line.split(':')[1].trim();
                        outputData.push(`${quesText}[/HTML]`);
                        endHTML = true;
                    } else if (hasQ) { //this is a question type that has a question line after the instructions
                        const quesText = line;
                        outputData.push(`${quesText}[/HTML]`);
                        endHTML = true;
                        hasQ = false;
                    } else {
                        if (!endHTML) {
                            outputData.push(`[/HTML]`);
                            endHTML = true;
                        }
                        lineMod = remPar(line);
                        outputData.push(lineMod);
                        cnt1++;
                        if (line.startsWith("*")) { starCnt++; } // Determine if the Multiple choice is a mulitple answer.

                        if (ft) {
                            switch (cnt1) {
                                case 1:
                                    outputData.push(`   [Media:true.jpg, "", "", width:300px;]`);
                                    break;
                                case 2:
                                    outputData.push(`   [Media:false.jpg, "", "", width:300px;]`);
                                    ft = false;
                                    break;
                                default:
                                    ft = false;
                                    console.log("error in true/false");
                            }
                        }
                        if (line.trim() === "") {
                            let foundIndex = -1;
                            for (let i = outputData.length - 1; i >= 0; i--) {   // Search backwards for the index of "[/HTML]"
                                if (outputData[i].includes('[/HTML]')) {
                                    foundIndex = i;
                                    break;
                                }
                            }
                            if (foundIndex === -1) console.log("whoops");  // If "[/HTML]" isn't found, display an error

                            if (c) {
                                const extractedLines = outputData.splice(foundIndex + 1);  // Extract lines from the original array and remove them
                                const transformed = transformText(extractedLines);
                                outputData.push(`${transformed}`);
                                outputData.push("");
                                c = false;
                            } else if (o) {
                                outputData.pop();
                                const linesArray = outputData.slice(foundIndex + 1);
                                outputData.push(generateLetterString(linesArray));
                                outputData.push("");
                                o = false;
                            } else if (fh) {
                                outputData.splice(-2, 1);
                            }

                        }

                    }
                }
            }
            // Handle any leftover buffer content
            if (buffer.length > 0) {
                outputData.push(...buffer);
            }
            // Catch the last iteration of starCnt to determine if MC is MA
            if (starCnt > 1) {
                changeLastMCtoMA(outputData);
            }

            var newPath = outputFile.replace(/^\.\/uploads\//, './converts/');
            fs.writeFileSync(newPath, outputData.join('\n'));

        }

        function isNumber(str) {
            const num = parseFloat(str);
            return !isNaN(num);
        }

        async function countAsteriskLines(rl) {
            let asteriskCount = 0;

            for await (const line of rl) {
                if (line.trim() === '') {
                    break;
                }

                if (line.startsWith('*')) {
                    asteriskCount++;
                }
            }

            return asteriskCount;
        }

        function changeLastMCtoMA(currentOutput) {
            // Search the lines in reverse order
            for (let i = currentOutput.length - 1; i >= 0; i--) {
                if (currentOutput[i] === "Type: MC") {
                    currentOutput[i] = "Type: MA";
                    break; // Stop searching once the first occurrence is found
                }
            }
            return currentOutput;
        }

        function remPar(str) {
            return str.replace(/\([^)]*\)/g, '').trim();
        }

        function transformText(lines) { // returns the right text line for Memory Cards Interaction
            const beforeEquals = [];
            const afterEquals = [];
            lines.forEach(line => {
                const parts = line.split('=');
                if (parts.length > 1) {
                    beforeEquals.push(parts[0].trim());
                    afterEquals.push(parts[1].trim());
                }
            });

            const quotedBefore = beforeEquals.map(entry => `"${entry}"`);
            const quotedAfter = afterEquals.map(entry => `"${entry}"`);
            const result = `a. {"source":[${quotedBefore.join(',')}],"target":[${quotedAfter.join(',')}]}`;

            return result;
        }

        function generateLetterString(arr) {
            const letters = 'abcdefghijklmnopqrstuvwxyz'; // Assuming we only need the first 26 letters
            let result = [];

            for (let i = 0; i < arr.length && i < letters.length; i++) {
                result.push(letters[i]);
            }

            return `[${result.join(', ')}]`;
        }
        if (!uploadedFile) {
            console.log("Please provide an input file as an argument.");
            process.exit(1);
        }
        const path = `./${uploadedFile.path}`
        processFile(path);
        res.status(200).send('Success')
    } else {
        res.status(400).send('No file uploaded.');
    }

});

const root = require('path').join(__dirname, '../client', 'build')
app.use(express.static(root));
app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

app.listen(port, () => console.log(`Listening on port http://localhost:${port}`)); //Line 6


