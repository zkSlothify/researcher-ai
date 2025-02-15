import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const loadSourceModules = async (): Promise<Record<string, any>> => {
  const sourceClasses: Record<string, any> = {};
  const sourcesDir = path.join(__dirname, "../", "plugins", "sources");
  
  const sourceFiles = fs.readdirSync(sourcesDir).filter(file => file.endsWith(".ts"));
  
  for (const file of sourceFiles) {
    const modulePath = path.join(sourcesDir, file);
    const moduleExports = await import(modulePath);
    const className = file.replace(".ts", "");

    sourceClasses[className] = moduleExports.default || moduleExports[className];
  }
  
  return sourceClasses;
};

export const resolveParam = (value: String): any => {
  if (value.startsWith("process.env.")) {
    const envVar = value.replace("process.env.", "");
    return process.env[envVar] || "";
  }
  return value;
};