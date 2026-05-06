#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg.startsWith("--")) {
    continue;
  }
  const key = arg.slice(2);
  const value = process.argv[index + 1]?.startsWith("--")
    ? "true"
    : process.argv[index + 1] ?? "true";
  args.set(key, value);
  if (value !== "true") {
    index += 1;
  }
}

const repoRoot = resolve(import.meta.dirname, "../../..");
const backendDir = resolve(
  args.get("backend") ??
    process.env.EXAM_BACKEND_DIR ??
    "/Users/nanfugongmeiying/Desktop/project/exam-backend-master"
);
const domain = args.get("domain") ?? "exam";
const outFile = args.get("out");
const pascalDomain = `${domain.slice(0, 1).toUpperCase()}${domain.slice(1)}`;
const dateTimeType = `${pascalDomain}DateTime`;

const sourceRoots = [
  join(backendDir, "web/src/main/java/com/ynfy/buss", domain),
];
const sourceFiles = [
  join(
    backendDir,
    `web/src/main/java/com/ynfy/app/api/v1/entity/dto/${pascalDomain}DTO.java`
  ),
  ...(domain === "course"
    ? [
        join(
          backendDir,
          "web/src/main/java/com/ynfy/app/api/v1/entity/dto/CourseCategoryDTO.java"
        ),
        join(
          backendDir,
          "web/src/main/java/com/ynfy/buss/mall/dto/OrderGoodsEvaluationDTO.java"
        ),
        join(
          backendDir,
          "web/src/main/java/com/ynfy/buss/mall/ordergoodsevaluation/entity/OrderGoodsEvaluation.java"
        ),
        join(
          backendDir,
          "web/src/main/java/com/ynfy/buss/mall/ordergoodsevaluation/entity/vo/GradeNumberVO.java"
        ),
      ]
    : []),
].filter(existsSync);

const javaTypeMap = new Map([
  ["String", "string"],
  ["java.lang.String", "string"],
  ["Integer", "number"],
  ["Long", "number"],
  ["long", "number"],
  ["Double", "number"],
  ["double", "number"],
  ["Float", "number"],
  ["float", "number"],
  ["Short", "number"],
  ["short", "number"],
  ["BigDecimal", "number"],
  ["Boolean", "boolean"],
  ["boolean", "boolean"],
  ["Date", dateTimeType],
  ["java.util.Date", dateTimeType],
  ["LocalDateTime", dateTimeType],
  ["LocalDate", dateTimeType],
]);

const walkJavaFiles = (dir) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkJavaFiles(path);
    }
    return entry.isFile() && entry.name.endsWith(".java") ? [path] : [];
  });
};

const cleanCommentLine = (line) =>
  line
    .replace(/^\s*\/\*\*?/, "")
    .replace(/\*\/\s*$/, "")
    .replace(/^\s*\*\s?/, "")
    .trim();

const toTsType = (javaType) => {
  const normalized = javaType
    .replace(/\s+/g, " ")
    .replace(/\?\s+extends\s+/g, "")
    .trim();

  if (normalized.endsWith("[]")) {
    return `${toTsType(normalized.slice(0, -2))}[]`;
  }

  const listMatch = normalized.match(/^(?:List|ArrayList)<(.+)>$/);
  if (listMatch) {
    return `${toTsType(listMatch[1])}[]`;
  }

  const pageMatch = normalized.match(/^IPage<(.+)>$/);
  if (pageMatch) {
    return `${pascalDomain}PageResponse<${toTsType(pageMatch[1])}>`;
  }

  const mapMatch = normalized.match(/^Map<(.+),\s*(.+)>$/);
  if (mapMatch) {
    return `Record<${toTsType(mapMatch[1])}, ${toTsType(mapMatch[2])}>`;
  }

  if (normalized === "Object" || normalized === "?") {
    return "unknown";
  }

  return javaTypeMap.get(normalized) ?? normalized;
};

const parseEnum = (source, file) => {
  const enumMatch = source.match(/public\s+enum\s+(\w+)\s*\{([\s\S]*?);/);
  if (!enumMatch) {
    return null;
  }

  const [, name, body] = enumMatch;
  const options = [...body.matchAll(/(\w+)\s*\(\s*([0-9]+)\s*,\s*"([^"]+)"\s*\)/g)].map(
    ([, key, value, label]) => ({
      key,
      value: Number(value),
      label,
    })
  );

  return options.length
    ? {
        name,
        options,
        file,
      }
    : null;
};

const parseClass = (source, file) => {
  const classMatch = source.match(/public\s+(?:class|interface)\s+(\w+)/);
  if (!classMatch) {
    return null;
  }

  const [, name] = classMatch;
  const lines = source.split(/\r?\n/);
  const fields = [];
  let comment = [];
  let annotations = [];
  let classStarted = false;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/public\s+(?:class|interface)\s+\w+/.test(trimmed)) {
      classStarted = true;
      comment = [];
      annotations = [];
      continue;
    }

    if (trimmed.startsWith("/**")) {
      inBlockComment = true;
      const cleaned = cleanCommentLine(trimmed);
      if (cleaned) {
        comment.push(cleaned);
      }
      if (trimmed.endsWith("*/")) {
        inBlockComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      const cleaned = cleanCommentLine(trimmed);
      if (cleaned) {
        comment.push(cleaned);
      }
      if (trimmed.endsWith("*/")) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith("@")) {
      if (classStarted) {
        annotations.push(trimmed);
      }
      continue;
    }

    if (!classStarted) {
      continue;
    }

    const fieldMatch = trimmed.match(/^private\s+(.+?)\s+(\w+)\s*;/);
    if (!fieldMatch) {
      continue;
    }

    const [, javaType, fieldName] = fieldMatch;
    if (/\b(?:static|final)\b/.test(javaType)) {
      continue;
    }

    const annotationText = annotations.join(" ");
    const dict = annotationText.match(/@Dict\(dicCode\s*=\s*"([^"]+)"/)?.[1];
    const schema = annotationText.match(/@Schema\(description\s*=\s*"([^"]+)"/)?.[1];
    const jsonFormat = annotationText.match(/@JsonFormat\([^)]*pattern\s*=\s*"([^"]+)"/)?.[1];

    fields.push({
      name: fieldName,
      javaType,
      tsType: toTsType(javaType),
      comment: comment.join(" "),
      dict,
      schema,
      jsonFormat,
    });

    comment = [];
    annotations = [];
  }

  return fields.length
    ? {
        name,
        fields,
        file,
      }
    : null;
};

const isTypeSource = (file) =>
  /\/(?:entity|dto|vo|enums|enmus)\//.test(file) &&
  !/\/(?:controller|service|job|mapper)\//.test(file);

const files = [...sourceRoots.flatMap(walkJavaFiles).filter(isTypeSource), ...sourceFiles];
const enums = [];
const classes = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const parsedEnum = parseEnum(source, file);
  if (parsedEnum) {
    enums.push(parsedEnum);
  }
  const parsedClass = parseClass(source, file);
  if (parsedClass) {
    classes.push(parsedClass);
  }
}

const lines = [
  "// Generated draft from Java sources. Review before using as API contract.",
  `// Backend: ${backendDir}`,
  `// Domain: ${domain}`,
  "",
  `export type ${dateTimeType} = string;`,
  "",
];

for (const item of enums.sort((a, b) => a.name.localeCompare(b.name))) {
  lines.push(`// ${relative(repoRoot, item.file)}`);
  lines.push(`export enum ${item.name} {`);
  for (const option of item.options) {
    lines.push(`  ${option.key} = ${option.value}, // ${option.label}`);
  }
  lines.push("}");
  lines.push(`export const ${item.name}Options = [`);
  for (const option of item.options) {
    lines.push(`  { label: "${option.label}", value: ${item.name}.${option.key} },`);
  }
  lines.push("] as const;");
  lines.push("");
}

for (const item of classes.sort((a, b) => a.name.localeCompare(b.name))) {
  lines.push(`// ${relative(repoRoot, item.file)}`);
  lines.push(`export interface ${item.name} {`);
  for (const field of item.fields) {
    const notes = [
      field.comment,
      field.schema ? `@Schema ${field.schema}` : "",
      field.dict ? `@Dict ${field.dict}` : "",
      field.jsonFormat ? `@JsonFormat ${field.jsonFormat}` : "",
    ].filter(Boolean);
    if (notes.length) {
      lines.push(`  /** ${notes.join(" | ")} */`);
    }
    lines.push(`  ${field.name}?: ${field.tsType};`);
  }
  lines.push("}");
  lines.push("");
}

const output = `${lines.join("\n")}\n`;

if (outFile) {
  const target = resolve(repoRoot, outFile);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output);
  console.log(`Wrote ${target}`);
} else {
  process.stdout.write(output);
}
