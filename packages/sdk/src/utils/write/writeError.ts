export function writeMonitextError(label: string, ...message: string[]){
    return `[Monitext[${label}]] ${message.join("")}`
}