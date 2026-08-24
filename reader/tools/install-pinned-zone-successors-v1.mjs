#!/usr/bin/env node
// Preserve admitted built-zone successors across the ordinary zone build.
// The binding, not this tool or build.sh, names the work and exact bytes.

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 ? process.argv[index + 1] : fallback;
};
const fail = (message) => { throw new Error(message); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const exact = (label, path, expected) => {
  const bytes = readFileSync(path);
  const actual = { bytes: bytes.length, sha256: sha256(bytes) };
  if (actual.bytes !== expected.bytes || actual.sha256 !== expected.sha256)
    fail(`${label} pin mismatch: ${actual.bytes}/${actual.sha256} != ${expected.bytes}/${expected.sha256}`);
  return actual;
};
const inside = (root, path) => {
  const rel = relative(root, path);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
};

const mode = arg("mode", "");
const bindingsPath = resolve(arg("bindings", "data/front-door-three-count-bindings-v1.json"));
const zonesRoot = resolve(arg("zones", "data/zones"));
const stageRoot = resolve(arg("stage", "build/pinned-zone-successors-v1"));
if (!new Set(["stage", "install"]).has(mode)) fail("--mode must be stage or install");
if (!existsSync(bindingsPath)) fail(`bindings absent: ${bindingsPath}`);

const bindings = JSON.parse(readFileSync(bindingsPath, "utf8"));
const moduleZonesRoot = resolve("data/zones");
const successors = Object.entries(bindings.inputs || {}).flatMap(([name, value]) => {
  if (!value?.zone?.module_path) return [];
  const logicalTarget = resolve(value.zone.module_path);
  if (!inside(moduleZonesRoot, logicalTarget)) fail(`${name} module target escapes data/zones: ${logicalTarget}`);
  const target = resolve(zonesRoot, relative(moduleZonesRoot, logicalTarget));
  if (!inside(zonesRoot, target)) fail(`${name} target escapes --zones: ${target}`);
  return [{ name, target, pin: value.zone }];
}).sort((a, b) => a.name.localeCompare(b.name));
if (!successors.length) fail("bindings carry no pinned zone successors");

const manifestPath = resolve(stageRoot, "manifest-v1.json");
const readValidStage = () => {
  if (!existsSync(manifestPath)) return null;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const bindingBytes = readFileSync(bindingsPath);
  if (manifest.bindings.bytes !== bindingBytes.length || manifest.bindings.sha256 !== sha256(bindingBytes))
    fail("bindings changed after the successor stage was written");
  if (manifest.entries.length !== successors.length) fail("staged successor set changed");
  return manifest.entries.map((entry) => {
    const successor = successors.find((value) => value.name === entry.name);
    if (!successor || entry.bytes !== successor.pin.bytes || entry.sha256 !== successor.pin.sha256 ||
        entry.target_module_path !== successor.pin.module_path)
      fail(`${entry.name} staged manifest disagrees with current binding`);
    const staged = resolve(stageRoot, basename(entry.staged_name));
    if (!inside(stageRoot, staged)) fail(`${entry.name} staged path escapes stage root`);
    exact(`${entry.name} staged zone`, staged, successor.pin);
    return { successor, staged };
  });
};
if (mode === "stage") {
  const priorStage = readValidStage();
  if (priorStage) {
    for (const { successor, staged } of priorStage) {
      copyFileSync(staged, successor.target);
      exact(`${successor.name} recovered zone from prior interrupted build`, successor.target, successor.pin);
    }
    console.log(`recovered ${priorStage.length} pinned zone successor${priorStage.length === 1 ? "" : "s"} from a prior interrupted build`);
  }
  rmSync(stageRoot, { recursive: true, force: true });
  mkdirSync(stageRoot, { recursive: true });
  const entries = successors.map(({ name, target, pin }) => {
    exact(`${name} admitted zone before build`, target, pin);
    const stagedName = `${name}-${pin.sha256}.bin`;
    const staged = resolve(stageRoot, stagedName);
    copyFileSync(target, staged);
    exact(`${name} staged zone`, staged, pin);
    return { name, target_module_path: pin.module_path, staged_name: stagedName, bytes: pin.bytes, sha256: pin.sha256 };
  });
  writeFileSync(manifestPath, JSON.stringify({
    schema: "mishkan.bezalel.pinned_zone_successor_stage.v1",
    status: "STAGED_FOR_ORDINARY_BUILD_REINSTALL",
    bindings: { path: bindingsPath, bytes: readFileSync(bindingsPath).length, sha256: sha256(readFileSync(bindingsPath)) },
    entries,
  }, null, 2) + "\n");
  console.log(`staged ${entries.length} pinned zone successor${entries.length === 1 ? "" : "s"}`);
} else {
  const stagedEntries = readValidStage();
  if (!stagedEntries) fail(`staged successor manifest absent: ${manifestPath}`);
  for (const { successor, staged } of stagedEntries) {
    copyFileSync(staged, successor.target);
    exact(`${successor.name} reinstalled zone`, successor.target, successor.pin);
  }
  rmSync(stageRoot, { recursive: true, force: true });
  console.log(`reinstalled ${stagedEntries.length} pinned zone successor${stagedEntries.length === 1 ? "" : "s"} and retired the stage`);
}
