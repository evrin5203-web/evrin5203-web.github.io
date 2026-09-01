import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = "/workspace/sites/angelina-somewhere";
const rassolSource = "/workspace/scratch/e3b4e9eeedca/rassol-new";
const rassolOutput = path.join(root, "public/portfolio/rassol");
const projectsPath = path.join(root, "app/data/projects.json");
const categoriesPath = path.join(root, "app/data/categories.json");

const order = [
  "rassol", "dvizhenie-ulits", "onda-ice-cream-packaging", "guide-find-a-groom",
  "esenin-museum-merch", "onda-identity", "onda-spoon", "fashion-store-summer",
  "flash-splash", "fort-1-stein", "pojmat-pero", "golden-apple-open-your-summer",
  "gorka-stend-onda", "etlon-eto-znak", "khvost-norm", "tochka-na-karte-kerch",
  "multiverse-pop-culture", "null-prekrasnoe-daleko", "office-glow",
  "molodezhny-sovet-petrograd", "studdy-task-tracker", "summer-cafe-concept",
  "punk-relikviya", "karkarona", "karkarona-book", "karkarona-posters",
  "poezdka-v-derevnyu", "modulnaya-vaza", "fasciaciya-mody", "notis",
  "nasledili", "dveri-i-kokosy", "snimki-band",
];

// Each project pixel sits next to an illustrated object. The vertical clusters
// follow the repeating ocean bands, so the project field stays dense but legible.
const anchors = [
  [1060, 900], [2920, 900], [760, 310], [3000, 360], [250, 880],
  [620, 1430], [1020, 1250], [1180, 2020], [1470, 2260], [2300, 1690],
  [2740, 1540], [3040, 2350], [3420, 1900], [380, 3270], [780, 3640],
  [1280, 4090], [1740, 3830], [2350, 3530], [2890, 4240], [3340, 3860],
  [250, 5100], [730, 5660], [1170, 5300], [1640, 5990], [2220, 5460],
  [2720, 6070], [3290, 5610], [420, 7000], [980, 6610], [1540, 7330],
  [2220, 6800], [2860, 7420], [3380, 6900],
];

const sourceFiles = (await fs.readdir(rassolSource)).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
);
await fs.mkdir(rassolOutput, { recursive: true });

const rassolImages = [];
for (let index = 0; index < sourceFiles.length; index += 1) {
  const file = sourceFiles[index];
  const source = path.join(rassolSource, file);
  const outputName = `${String(index + 1).padStart(3, "0")}.webp`;
  const output = path.join(rassolOutput, outputName);
  const animated = file.toLowerCase().endsWith(".gif");
  await sharp(source, { animated, limitInputPixels: false })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: animated ? 72 : 81, effort: animated ? 3 : 5, smartSubsample: true })
    .toFile(output);
  const metadata = await sharp(output, { animated: true, limitInputPixels: false }).metadata();
  rassolImages.push({
    src: `/portfolio/rassol/${outputName}`,
    width: metadata.width ?? 1,
    height: metadata.pageHeight ?? metadata.height ?? 1,
    animated,
  });
}

const projects = JSON.parse(await fs.readFile(projectsPath, "utf8"));
const byId = new Map(projects.map((project) => [project.id, project]));
const nextProjects = order.map((id, index) => {
  const project = byId.get(id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  const categories = [...new Set((project.categories ?? [])
    .filter((category) => category !== "art-direction")
    .map((category) => category === "ux-ui" ? "web" : category))];
  if (id === "guide-find-a-groom" && !categories.includes("special-project")) {
    categories.push("special-project");
  }
  const [x, y] = anchors[index];
  return {
    ...project,
    categories,
    number: index + 1,
    x,
    y,
    ...(id === "rassol" ? {
      cover: rassolImages[0].src,
      images: rassolImages,
      selectedFrames: [0, 19, 27],
    } : {}),
  };
});

const categories = JSON.parse(await fs.readFile(categoriesPath, "utf8"))
  .filter((category) => !["art-direction", "ux-ui"].includes(category.id))
  .map((category) => category.id === "web"
    ? { ...category, ru: "Web / UX/UI", en: "Web / UX/UI" }
    : category);

await fs.writeFile(projectsPath, JSON.stringify(nextProjects, null, 2));
await fs.writeFile(categoriesPath, JSON.stringify(categories, null, 2));
await fs.writeFile(path.join(root, "app/data/portfolio-audit.json"), JSON.stringify({
  totalProjects: nextProjects.length,
  totalImages: nextProjects.reduce((sum, project) => sum + project.images.length, 0),
  projects: nextProjects.map((project) => ({ id: project.id, images: project.images.length })),
}, null, 2));

console.log(JSON.stringify({
  projects: nextProjects.length,
  images: nextProjects.reduce((sum, project) => sum + project.images.length, 0),
  rassolImages: rassolImages.length,
  first: nextProjects[0].id,
  last: nextProjects.at(-1).id,
}, null, 2));
