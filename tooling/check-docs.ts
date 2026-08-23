import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const maximumMarkdownLines = 300;
const maximumAgentContextLines = 1_200;
const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
const repositoryRoot = process.cwd();

const markdownFiles = await collectMarkdownFiles(repositoryRoot);
const contents = new Map(
  await Promise.all(
    markdownFiles.map(async (file) => [file, await readFile(file, "utf8")] as const),
  ),
);
const errors = Array<string>();

for (const [file, content] of contents) {
  const lines = countLines(content);
  if (lines > maximumMarkdownLines) {
    errors.push(`${displayPath(file)} has ${lines} lines; the maximum is ${maximumMarkdownLines}.`);
  }

  for (const target of extractLocalTargets(content)) {
    const error = await validateTarget({ sourceFile: file, target });
    if (error) {
      errors.push(error);
    }
  }
}

const agentContextLines = [...contents]
  .filter(([file]) => isAlwaysRelevant(file))
  .reduce((total, [, content]) => total + countLines(content), 0);

if (agentContextLines > maximumAgentContextLines) {
  errors.push(
    `Always-relevant agent context has ${agentContextLines} lines; the maximum is ${maximumAgentContextLines}.`,
  );
}

if (errors.length > 0) {
  console.error(
    ["Documentation checks failed:", ...errors.map((error) => `- ${error}`)].join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Documentation checks passed (${markdownFiles.length} files, ${agentContextLines} agent-context lines).`,
  );
}

async function collectMarkdownFiles(directory: string) {
  const directories = [directory];
  const files = Array<string>();

  while (directories.length > 0) {
    const currentDirectory = directories.shift();
    if (!currentDirectory) {
      continue;
    }
    const entries = await readdir(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const path = resolve(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          directories.push(path);
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(path);
      }
    }
  }
  return files.sort();
}

function countLines(content: string) {
  return content.length === 0 ? 0 : content.replace(/\n$/u, "").split(/\r?\n/u).length;
}

function displayPath(file: string) {
  return relative(repositoryRoot, file).replaceAll("\\", "/");
}

function isAlwaysRelevant(file: string) {
  const path = displayPath(file);
  return path === "AGENTS.md" || path === "docs/README.md" || path.startsWith("docs/architecture/");
}

function extractLocalTargets(content: string) {
  const targets = Array<string>();
  const markdownLinks =
    /!?\[[^\]]*\]\((?:<(?<wrapped>[^>]+)>|(?<plain>[^\s)]+))(?:\s+["'][^"']*["'])?\)/gu;
  const htmlLinks = /(?:href|src)=["'](?<target>[^"']+)["']/gu;

  for (const match of content.matchAll(markdownLinks)) {
    const target = match.groups?.wrapped ?? match.groups?.plain;
    if (target && isLocalTarget(target)) {
      targets.push(target);
    }
  }
  for (const match of content.matchAll(htmlLinks)) {
    const target = match.groups?.target;
    if (target && isLocalTarget(target)) {
      targets.push(target);
    }
  }
  return targets;
}

function isLocalTarget(target: string) {
  return !target.startsWith("//") && !/^[a-z][a-z\d+.-]*:/iu.test(target);
}

async function validateTarget({ sourceFile, target }: { sourceFile: string; target: string }) {
  const [encodedPath = "", encodedAnchor] = target.split("#", 2);
  const path = decodeURIComponent(encodedPath.split("?", 1)[0] ?? "");
  const targetPath = path.length === 0 ? sourceFile : resolve(dirname(sourceFile), path);
  const targetStats = await stat(targetPath).catch(() => undefined);

  if (!targetStats) {
    return `${displayPath(sourceFile)} links to missing path ${target}.`;
  }
  if (!encodedAnchor || !targetStats.isFile() || !targetPath.endsWith(".md")) {
    return undefined;
  }

  const anchors = collectAnchors(await readFile(targetPath, "utf8"));
  const anchor = decodeURIComponent(encodedAnchor).toLowerCase();
  return anchors.has(anchor)
    ? undefined
    : `${displayPath(sourceFile)} links to missing anchor #${encodedAnchor} in ${displayPath(targetPath)}.`;
}

function collectAnchors(content: string) {
  const anchors = new Set<string>();
  const occurrences = new Map<string, number>();
  const headings = /^#{1,6}\s+(?<heading>.+?)\s*#*\s*$/gmu;

  for (const match of content.matchAll(headings)) {
    const base = (match.groups?.heading ?? "")
      .replace(/<[^>]*>/gu, "")
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .trim()
      .replace(/\s+/gu, "-")
      .toLowerCase();
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);
    anchors.add(occurrence === 0 ? base : `${base}-${occurrence}`);
  }
  return anchors;
}
