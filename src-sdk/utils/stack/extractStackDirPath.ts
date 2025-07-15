import { normalizaPathEnd, normalizaPathStart } from "./shortenStackPath";

/**
 * Extracts the directory path (without filename) from a stack trace line.
 *
 * @param line Stack trace line with a file:// path
 * @returns Directory path as a string, or null if not found
 */
export function extractStackDirPath(line: string): string | null {
    const match = line.match(/\(file:\/\/\/(.+?):\d+:\d+\)/);
    if (!match) return null;

    const fullPath = match[1]; // e.g., /home/user/project/file.ts

    // Extract directory by removing the file name
    const segments = fullPath.split('/');
    segments.pop(); // remove filename
    return normalizaPathEnd(normalizaPathStart(segments.join('/')));
}
