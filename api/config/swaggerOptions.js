import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el archivo YAML de documentación
const swaggerYamlPath = join(__dirname, "../swagger.yaml");
const swaggerYamlContent = readFileSync(swaggerYamlPath, "utf8");

// Parsear el contenido YAML a un objeto JavaScript
const swaggerSpec = yaml.load(swaggerYamlContent);

export default swaggerSpec;