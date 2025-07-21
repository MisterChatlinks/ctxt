export function convertTime(time: number): {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
} {
    const totalSeconds = Math.floor(time / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    let remainingTotalSeconds = totalSeconds % 3600;

    const minutes = Math.floor(remainingTotalSeconds / 60);
    const seconds = remainingTotalSeconds % 60;
    const milliseconds = time % 1000;

    return { hours, minutes, seconds, milliseconds };
}

export function writeTimeString(data: ReturnType<typeof convertTime>) {
    const result: string[] = [];

    const unit = (val: number, singular: string, plural: string) =>
        `${val} ${val === 1 ? singular : plural}`;

    if (data.hours) result.push(unit(data.hours, "hour", "hours"));
    if (data.minutes) result.push(unit(data.minutes, "minute", "minutes"));
    if (data.seconds) result.push(unit(data.seconds, "second", "seconds"));

    if (data.milliseconds || result.length === 0)
        result.push(unit(data.milliseconds, "millisecond", "milliseconds"));

    return result.join(" ");
}
