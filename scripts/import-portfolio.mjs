import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = "/workspace/sites/angelina-somewhere";
const sourceRoot = "/workspace/scratch/e3b4e9eeedca/drive-originals";
const textRoot = "/workspace/scratch/e3b4e9eeedca/portfolio-texts/portfolio_database_texts";
const outputRoot = path.join(projectRoot, "public", "portfolio");
const dataRoot = path.join(projectRoot, "app", "data");
const selectedIds = new Set([
  "dvizhenie-ulits",
  "rassol",
  "onda-ice-cream-packaging",
  "guide-find-a-groom",
]);

const metadata = JSON.parse(await fs.readFile(path.join(textRoot, "projects.json"), "utf8"));
const categories = JSON.parse(await fs.readFile(path.join(textRoot, "categories.json"), "utf8"));
const byId = new Map(metadata.map((project) => [project.id, project]));
const sourceSlugs = (await fs.readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
await fs.mkdir(dataRoot, { recursive: true });

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

async function optimise(slug, file, index) {
  const source = path.join(sourceRoot, slug, file);
  const outputDirectory = path.join(outputRoot, slug);
  const outputName = `${String(index + 1).padStart(3, "0")}.webp`;
  const output = path.join(outputDirectory, outputName);
  await fs.mkdir(outputDirectory, { recursive: true });

  const animated = file.toLowerCase().endsWith(".gif");
  const input = sharp(source, { animated, limitInputPixels: false }).rotate();
  await input
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: animated ? 72 : 79, effort: animated ? 3 : 5, smartSubsample: true })
    .toFile(output);

  const info = await sharp(output, { animated: true, limitInputPixels: false }).metadata();
  return {
    src: `/portfolio/${slug}/${outputName}`,
    width: info.width ?? 1,
    height: info.pageHeight ?? info.height ?? 1,
    animated: Boolean(animated),
  };
}

const processed = [];
const queue = [];
for (const slug of sourceSlugs) {
  const files = (await fs.readdir(path.join(sourceRoot, slug))).sort(naturalSort);
  const images = new Array(files.length);
  processed.push({ slug, files, images });
  files.forEach((file, index) => queue.push({ slug, file, index, images }));
}

let cursor = 0;
async function worker() {
  while (cursor < queue.length) {
    const item = queue[cursor++];
    item.images[item.index] = await optimise(item.slug, item.file, item.index);
  }
}
await Promise.all(Array.from({ length: 5 }, worker));

const positions = [
  [260, 1210], [580, 1460], [900, 1840], [1210, 1320], [1510, 1680], [1830, 2070],
  [2150, 1430], [2460, 1830], [2780, 2290], [3100, 1550], [3380, 1990], [420, 2420],
  [760, 2800], [1110, 2320], [1450, 3150], [1780, 2570], [2120, 3450], [2460, 2760],
  [2810, 3160], [3190, 2570], [3460, 3630], [240, 3790], [630, 4250], [1020, 3530],
  [1400, 4510], [1800, 3920], [2200, 4860], [2580, 4100], [2990, 4580], [3380, 4020],
  [500, 5180], [1350, 5480], [2750, 5360],
];
const colors = ["#6c5bc7", "#fe572a", "#daff02"];

const projects = processed.map((entry, index) => {
  const source = byId.get(entry.slug);
  if (!source) throw new Error(`Missing metadata for ${entry.slug}`);
  const [x, y] = positions[index % positions.length];
  return {
    id: entry.slug,
    title: source.title,
    description: source.description,
    categories: source.categories ?? [],
    sourceUrl: source.source_url ?? null,
    cover: entry.images[0]?.src ?? "",
    images: entry.images,
    selected: selectedIds.has(entry.slug),
    number: index + 1,
    x,
    y,
    color: colors[index % colors.length],
  };
});

const audit = {
  totalProjects: projects.length,
  totalImages: projects.reduce((sum, project) => sum + project.images.length, 0),
  projects: projects.map((project) => ({ id: project.id, images: project.images.length })),
};

await fs.writeFile(path.join(dataRoot, "projects.json"), JSON.stringify(projects, null, 2));
await fs.writeFile(path.join(dataRoot, "categories.json"), JSON.stringify(categories, null, 2));
await fs.writeFile(path.join(dataRoot, "portfolio-audit.json"), JSON.stringify(audit, null, 2));
console.log(JSON.stringify(audit, null, 2));
