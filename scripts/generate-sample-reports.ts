import { db } from "../src/server/db";
import { users } from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "../src/server/lib/auth";
import puppeteer from "puppeteer";
import * as path from "path";
import * as fs from "fs";

async function run() {
  console.log("Generating actual PDFs natively via Intelligence Reports...");

  const admin = await db.query.users.findFirst({
    where: eq(users.role, "Admin"),
  });

  if (!admin) {
    console.error("No Admin user found!");
    process.exit(1);
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId: admin.id, expires });

  const outDir = path.join(process.cwd(), ".temp-reports");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    (window as any).downloadedBlobs = {};
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function (obj) {
      const url = originalCreateObjectURL.call(URL, obj);
      if (obj instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          (window as any).downloadedBlobs[url] = reader.result;
        };
        reader.readAsDataURL(obj);
      }
      return url;
    };
  });

  await page.setCookie({
    name: "session",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  console.log("Navigating to Intelligence Reports (/admin/reports)...");
  await page.goto("http://localhost:3000/admin/reports", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Wait for React Query to load data
  await new Promise((r) => setTimeout(r, 8000));

  // Select a user other than self
  await page.evaluate(() => {
    const select = document.querySelector("select");
    if (select && select.options.length > 1) {
      const option = select.options[1];
      if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  await new Promise((r) => setTimeout(r, 3000));

  console.log("Clicking Export Sales PDF...");
  await page.waitForSelector("#export-sales-pdf", {
    visible: true,
    timeout: 60000,
  });
  await page.click("#export-sales-pdf");

  await new Promise((r) => setTimeout(r, 3000));

  console.log("Clicking Export Attendance PDF...");
  await page.waitForSelector("#export-attendance-pdf", {
    visible: true,
    timeout: 60000,
  });
  await page.click("#export-attendance-pdf");

  await new Promise((r) => setTimeout(r, 5000)); // wait for downloads to complete

  // Retrieve blobs and save
  const blobs: Record<string, string> = await page.evaluate(
    () => (window as any).downloadedBlobs,
  );
  let fileCount = 1;
  for (const [url, dataUrl] of Object.entries(blobs)) {
    if (dataUrl) {
      const base64Data = dataUrl.split(",")[1];
      const filename = `report-${fileCount++}.pdf`;
      if (base64Data) {
        fs.writeFileSync(
          path.join(outDir, filename),
          Buffer.from(base64Data, "base64"),
        );
        console.log(`Saved ${filename} to .temp-reports`);
      }
    }
  }

  await browser.close();
  console.log(`Done generating actual PDFs into ${outDir}`);
  process.exit(0);
}

run().catch((e) => {
  console.error("Error generating native PDFs:", e);
  process.exit(1);
});
