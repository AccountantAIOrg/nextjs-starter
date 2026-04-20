import { DbService } from "@krutai/db-service";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

async function main() {
  try {
    const apiKey = process.env.KRUTAI_API_KEY!;
    const serverUrl = process.env.KRUTAI_SERVER_URL!;
    const projectId = process.env.KRUTAI_DB_PROJECT_ID! || process.env.PROJECT_ID!;
    const dbName = process.env.KRUTAI_DB_NAME! || process.env.PROJECT_DB_NAME!;

    if (!apiKey || !serverUrl || !projectId || !dbName) {
      console.error("Missing credentials in .env");
      process.exit(1);
    }

    const dbService = new DbService({
      apiKey,
      serverUrl,
    });

    await dbService.initialize();

    const config = await dbService.getDbConfig({
      projectId,
      dbName,
    });

    console.log("Retrieved DATABASE_URL:", config.dbUrl);

    // Read the current .env file
    let envContent = fs.readFileSync(".env", "utf8");

    // Replace or append DATABASE_URL
    if (envContent.match(/^DATABASE_URL=.*$/m)) {
      envContent = envContent.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${config.dbUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${config.dbUrl}"\n`;
    }

    // Fix aliases for PROJECT_ID and PROJECT_DB_NAME
    if (!envContent.includes("PROJECT_ID=")) {
      envContent += `\nPROJECT_ID="${projectId}"\n`;
    }
    if (!envContent.includes("PROJECT_DB_NAME=")) {
      envContent += `PROJECT_DB_NAME="${dbName}"\n`;
    }

    fs.writeFileSync(".env", envContent);
    console.log("Successfully updated .env file with DATABASE_URL.");
  } catch (err) {
    console.error("Error retrieving DB URL:", err);
  }
}

main();
