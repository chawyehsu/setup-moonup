"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var core = __toESM(require("@actions/core"));
var exec = __toESM(require("@actions/exec"));
var hc = __toESM(require("@actions/http-client"));
var tc = __toESM(require("@actions/tool-cache"));
var os = __toESM(require("os"));
var import_node_path = __toESM(require("path"));
var semver = __toESM(require("semver"));
async function getLatestMoonup() {
  core.startGroup("Determine the latest moonup version");
  const url = "https://api.github.com/repos/chawyehsu/moonup/releases/latest";
  const client = new hc.HttpClient("chawyehsu/setup-moonup", [], {
    allowRetries: true,
    maxRetries: 3
  });
  try {
    const response = await client.getJson(url);
    if (!response.result) {
      throw new Error(`chawyehsu/setup-moonup: Could not download latest release from ${url}`);
    }
    const tag = semver.clean(response.result.name);
    if (!tag) {
      throw new Error(`chawyehsu/setup-moonup: Could not parse version from ${response.result.name}`);
    }
    const version = tag.replace(/^v/, "");
    core.debug(`Latest moonup version is ${version}`);
    return version;
  } catch (error) {
    throw error;
  } finally {
    core.endGroup();
  }
}
function buildMoonupDownloadUrl(version) {
  const platform2 = os.platform();
  const arch2 = os.arch();
  const ext = platform2 === "win32" ? "zip" : "tar.gz";
  let fileName = void 0;
  switch (platform2) {
    case "darwin":
      fileName = `moonup-${arch2 === "arm64" ? "aarch64" : "x86_64"}-apple-darwin.${ext}`;
      break;
    case "linux":
      fileName = `moonup-x86_64-unknown-linux-gnu.${ext}`;
      break;
    case "win32":
      fileName = `moonup-x86_64-pc-windows-msvc.${ext}`;
      break;
    default:
      throw new Error(`chawyehsu/setup-moonup: The platform ${platform2} is not supported`);
  }
  return `https://github.com/chawyehsu/moonup/releases/download/v${version}/${fileName}`;
}
function getMoonBitVersion() {
  let version = core.getInput("moonbit-version");
  if (version === "") {
    version = "latest";
  }
  return version;
}
async function run() {
  core.startGroup("Download and install moonup");
  try {
    const moonupHome = import_node_path.default.join(os.homedir(), ".moonup");
    const moonupVersion = await getLatestMoonup();
    let moonupBinPath = tc.find("moonup", moonupVersion);
    if (moonupBinPath !== "") {
      core.debug(`moonup ${moonupVersion} is already installed at ${moonupBinPath}`);
    } else {
      const moonupUrl = buildMoonupDownloadUrl(moonupVersion);
      core.info(`Downloading moonup from ${moonupUrl}`);
      const archive = await tc.downloadTool(moonupUrl);
      moonupBinPath = import_node_path.default.join(moonupHome, "bin");
      os.platform() === "win32" ? await tc.extractZip(archive, moonupBinPath) : await tc.extractTar(archive, moonupBinPath);
      await tc.cacheDir(moonupBinPath, "moonup", moonupVersion);
    }
    core.debug(`moonup is installed to ${moonupHome}`);
    core.addPath(moonupBinPath);
  } catch (error) {
    throw error;
  } finally {
    core.endGroup();
  }
  core.startGroup("Download and install MoonBit");
  try {
    const moonbitVersion = getMoonBitVersion();
    const args = ["install"];
    if (moonbitVersion) {
      args.push(moonbitVersion);
    }
    await exec.exec("moonup", args);
    const moonHome = import_node_path.default.join(os.homedir(), ".moon");
    const moonBinPath = import_node_path.default.join(moonHome, "bin");
    core.debug(`MoonBit is installed to ${moonHome}`);
    core.addPath(moonBinPath);
  } catch (error) {
    throw error;
  } finally {
    core.endGroup();
  }
}
run();
