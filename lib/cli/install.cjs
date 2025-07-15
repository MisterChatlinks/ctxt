const { chmodSync, copyFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const os = require("os");
const process = require("process");

function getTarget() {
    const platform = os.platform();
    const arch = os.arch();

    if (platform === "darwin" && arch === "arm64") return "darwin-arm64";
    if (platform === "darwin") return "darwin-x64";
    if (platform === "linux") return "linux-x64";
    if (platform === "win32") return "windows-x64";

    console.error(`❌ Unsupported platform: ${platform} ${arch}`);
    process.exit(1);
}

try {
    const target = getTarget();
    const src = join(
        __dirname,
        "dist",
        "cli",
        target,
        process.platform === "win32" ? "monitext.exe" : "monitext",
    );
    const dest = join(
        __dirname,
        "lib",
        "cli",
        process.platform === "win32" ? "monitext.exe" : "monitext",
    );

    if (!existsSync(join(__dirname, "lib", "cli"))) {
        mkdirSync(join(__dirname, "lib", "cli"), { recursive: true });
    }

    copyFileSync(src, dest);

    if (process.platform !== "win32") {
        chmodSync(dest, 0o755);
    }

    console.log(`✅ Installed monitext CLI for ${target}`);
} catch (err) {
    console.error("❌ Install failed:", err);
    process.exit(1);
}
