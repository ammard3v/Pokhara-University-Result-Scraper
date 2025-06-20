const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    baseUrl: 'https://exam.pu.edu.np:9094/Home/ViewResultSubmit',
    parameters: {
        Year: '2024',
        Academic_System: 'Fall',
        Semester: '7th',
        Exam_Type: 'Regular_Retake',
        Program: 'Bachelor of Computer Application',
        DOB: '2001-01-01'
    },
    symbolRange: {
        start: 21530001,
        end: 21530306,
    },
    outputDir: 'results',
    headless: true,
    timeout: 30000,
    delayBetweenRequests: 2000
};

async function extractResultData(page) {
    // Extract student details
    const studentInfo = await page.$$eval('.row span', spans => {
        const info = {};
        spans.forEach(span => {
            const text = span.innerText.trim();
            if (text.includes("Student Name:")) info.name = text.split(":")[1].trim();
            if (text.includes("Exam Roll No:")) info.rollNo = text.split(":")[1].trim();
            if (text.includes("Registration Number:")) info.regNo = text.split(":")[1].trim();
            if (text.includes("Semester:")) info.semester = text.split(":")[1].trim();
            if (text.includes("Level:")) info.level = text.split(":")[1].trim();
            if (text.includes("Faculty:")) info.faculty = text.split(":")[1].trim();
            if (text.includes("Program:")) info.program = text.split(":")[1].trim();
            if (text.includes("College Name:")) info.college = text.split(":")[1].trim();
        });
        return info;
    });

    // Extract subject data and summary
    const tableData = await page.$$eval('table tbody tr', rows => {
        const data = {
            subjects: [],
            totalCredit: '',
            sgpa: ''
        };

        rows.forEach(row => {
            const cols = row.querySelectorAll('td');

            // Subject rows (6 columns with S.No)
            if (cols.length === 6 && cols[0].textContent.trim() !== '') {
                data.subjects.push({
                    sno: cols[0].textContent.trim(),
                    code: cols[1].textContent.trim(),
                    title: cols[2].textContent.trim(),
                    credit: cols[3].textContent.trim(),
                    grade: cols[4].textContent.trim(),
                    remarks: cols[5].textContent.trim()
                });
            }
            else if (cols.length >= 4 && cols[2].textContent.trim().includes("Total")) {
                const creditCell = cols[3]?.textContent?.trim();
                const sgpaCell = cols[4]?.textContent?.trim();

                if (creditCell) data.totalCredit = creditCell;

                if (sgpaCell) {
                    const sgpaMatch = sgpaCell.match(/SGPA\s*=\s*([\d.]+)/);
                    if (sgpaMatch) data.sgpa = sgpaMatch[1];
                }
            }

        });

        return data;
    });

    return {
        ...studentInfo,
        subjects: tableData.subjects,
        totalCredit: tableData.totalCredit,
        sgpa: tableData.sgpa
    };
}

async function generateCSV(resultData) {
    let csv = "Field,Value\n";

    // Student info
    csv += `"Student Name","${resultData.name || ''}"\n`;
    csv += `"Exam Roll No","${resultData.rollNo || ''}"\n`;
    csv += `"Registration Number","${resultData.regNo || ''}"\n`;
    csv += `"Semester","${resultData.semester || ''}"\n`;
    csv += `"Level","${resultData.level || ''}"\n`;
    csv += `"Faculty","${resultData.faculty || ''}"\n`;
    csv += `"Program","${resultData.program || ''}"\n`;
    csv += `"College Name","${resultData.college || ''}"\n`;
    csv += `"Total Credit","${resultData.totalCredit || ''}"\n`;
    csv += `"SGPA","${resultData.sgpa || ''}"\n`;

    // Course details
    csv += "\n\nCourse Details\n";
    csv += "S.No,Code No.,Course Title,Credit,Grade,Remarks\n";

    resultData.subjects.forEach(sub => {
        csv += `"${sub.sno}","${sub.code}","${sub.title}","${sub.credit}","${sub.grade}","${sub.remarks}"\n`;
    });

    // Add Total/SGPA row
    csv += `\n"Total","","","${resultData.totalCredit || ''}","SGPA = ${resultData.sgpa || ''}",""\n`;

    return csv;
}

async function scrapePUResult(symbolNumber) {
    const browser = await puppeteer.launch({ headless: config.headless });
    const page = await browser.newPage();

    try {
        // Create output directory
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir);
        }

        // Build URL
        const params = { ...config.parameters, Symbol_Number: symbolNumber };
        const url = `${config.baseUrl}?${new URLSearchParams(params).toString()}`;

        console.log(`Fetching: ${symbolNumber}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: config.timeout });

        // Check for valid result
        const hasResult = await page.evaluate(() => {
            return document.querySelector('table tbody tr td.text-bold') !== null;
        });

        if (!hasResult) {
            console.log(`No result found for ${symbolNumber}`);
            return null;
        }

        // Extract data
        const resultData = await extractResultData(page);
        const csvContent = await generateCSV(resultData);

        // Save to file
        const filename = `PU_Result_${resultData.rollNo || symbolNumber}.csv`;
        fs.writeFileSync(path.join(config.outputDir, filename), csvContent);

        console.log(`Saved: ${filename}`);
        return {
            symbolNumber,
            ...resultData
        };

    } catch (error) {
        console.error(`Error processing ${symbolNumber}:`, error.message);
        return null;
    } finally {
        await browser.close();
    }
}

async function scrapeRange() {
    const results = [];

    for (let i = config.symbolRange.start; i <= config.symbolRange.end; i++) {
        const result = await scrapePUResult(i.toString());
        if (result) results.push(result);

        if (i < config.symbolRange.end) {
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
        }
    }

    // Generate summary
    if (results.length > 0) {
        const summary = results.map(r => ({
            name: r.name,
            symbol: r.symbolNumber,
            rollNo: r.rollNo,
            college: r.college,
            credit: r.totalCredit,
            sgpa: r.sgpa
        }));

        const summaryCsv = [
            'Name,Symbol,Roll No,College Name,Total Credit,SGPA',
            ...summary.map(s =>
                `"${s.name}","${s.symbol}","${s.rollNo}","${s.college}","${s.credit}","${s.sgpa}"`
            )
        ].join('\n');

        fs.writeFileSync(path.join(config.outputDir, 'summary.csv'), summaryCsv);
        console.log('\nSummary report generated');
    }


    console.log(`\nCompleted. Processed ${results.length} results`);
}

// Run the scraper
scrapeRange().catch(err => console.error('Scraping failed:', err));