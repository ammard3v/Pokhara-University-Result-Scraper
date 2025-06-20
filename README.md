# 📘 Pokhara University Result Scraper

This Node.js script uses **Puppeteer** to scrape student result data from the official **Pokhara University (PU)** examination portal:
🌐 [https://exam.pu.edu.np:9094](https://exam.pu.edu.np:9094)

It automates the result lookup process for a range of symbol numbers, extracts student details and subject-wise grades, and saves everything in CSV format. A summary CSV file is also generated for quick overview.

---

## ⚠️ DISCLAIMER

> This script interacts with the **official Pokhara University examination website**.
> It is intended **strictly for educational and personal learning purposes**.

* I am a **student** of Pokhara University and use this script to explore browser automation and data extraction.
* It only accesses **publicly available result data** without requiring login, hacking, or tampering.
* It is made **with no harmful intent** and , purely for **learning** purposes.

### Please Note:

* This tool is **not officially affiliated with or endorsed** by Pokhara University.
* Scraping public portals may be restricted by terms of service.
* The author is **not responsible** for any misuse, legal issues, or policy violations resulting from this script.

> ❗ **Use it responsibly, ethically, and at your own risk.**

---

## 🔧 Features

* ✅ Automatically scrapes results over a range of symbol numbers
* ✅ Extracts student profile info and all subject-wise grades
* ✅ Saves each student's data into a separate CSV file
* ✅ Generates a `summary.csv` with SGPA, name, and key info

---

## 💻 Requirements

* [Node.js](https://nodejs.org/) v14 or later
* Puppeteer package

### 📦 Install Puppeteer:

```bash
npm install puppeteer
```

---

## 🛠 Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/ammard3v/Pokhara-University-Result-Scraper
   cd Pokhara-University-Result-Scraper
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure scraping options in `run.js`:

   ```js
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
   ```

---

## 🚀 How to Run

Run the script with:

```bash
node run.js
```

📂 Output will be saved to the `results/` folder:

* `PU_Result_<rollNo>.csv` – Individual student result
* `summary.csv` – Overview of all scraped results

---

## 📁 Output Structure

* `results/PU_Result_21530045.csv` — Single student's detailed grades
* `results/summary.csv` — Summary with name, SGPA, symbol number, etc.

---

## 📚 Educational Purpose Only

This project is a great hands-on introduction to:

* Headless browser automation with Puppeteer
* Web scraping structured table data
* Working with HTML forms programmatically
* Writing structured CSV output in Node.js

> Feel free to fork, customize, or improve it for your own learning!

---

## 📜 License

This project is open source under the [MIT License](LICENSE).

---

## 📫 Contact

Got suggestions or want to contribute?

* Open an [issue](https://github.com/ammard3v/Pokhara-University-Result-Scraper/issues)
* Submit a pull request
* Or just star the repo if it helped you ⭐

Happy scraping – and remember to stay ethical! 🧑‍💻🎓
