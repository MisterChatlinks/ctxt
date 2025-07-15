/**
 * @purpose Shortens stack trace paths by removing a common base path.
 * 
 * @param line A single line from a stack trace
 * @param base The base path to strip (absolute path, no "file://" prefix)
 * @returns Shortened stack trace line
 */
export function shortenStackPath(line: string, base: string): string {

    if (!line.includes(base)) {
        return line
    }

    return line.replace(/file:\/\/\/([^():]+)(:\d+:\d+)?/g, (_, path, position) => {
        const cleanedBase = normalizaPathEnd(normalizaPathStart(base));
        const cleanedPath = normalizaPathStart(path);
        const relativePath = cleanedPath.startsWith(cleanedBase)
            ? cleanedPath.slice(cleanedBase.length)
            : cleanedPath;
        return relativePath + (position || '');
    });
}

export function normalizaPathStart(path: string) {
    return path.match(/^[a-zA-Z\d_]*\:\//) ? path : path.match(/^[a-zA-Z\d_]*\:\//) ? path : path.match(/^[a-zA-Z\d_]*\:\//) ? path : path.startsWith('/') ? path : `/${path}`;
}

export function normalizaPathEnd(path: string) {
    return path.endsWith('/') ? path : `${path}/`;
}