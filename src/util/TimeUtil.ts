
export class TimeUtil {

    /**
     * 
     * @param timeSeparator 
     * @param millisecondsEnabled 
     * @returns Current full date with time in format 2021-03-15 20:01:02 (with default time separator ':')
     */
    public static getFullTimestamp(timeSeparator = ":", millisecondsEnabled = false): string {
        const date = new Date();
        return TimeUtil.getFullTimestampFromDate(date, timeSeparator, millisecondsEnabled);
    }

    /**
     * 
     * @param date 
     * @param timeSeparator 
     * @param millisecondsEnabled 
     * @returns Full date with time in format 2021-03-15 20:01:02 (with default time separator ':')
     */
    public static getFullTimestampFromDate(date: Date, timeSeparator = ":", millisecondsEnabled = false): string {
        const year = date.getFullYear();
        const month = TimeUtil.toTwoDigits(date.getMonth() + 1);
        const day = TimeUtil.toTwoDigits(date.getDate());
        return year + "-" + month + "-" + day + " " + TimeUtil.getTimestampFromDate(date, timeSeparator, millisecondsEnabled);
    }

    public static getYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = TimeUtil.toTwoDigits(date.getMonth() + 1);
        const day = TimeUtil.toTwoDigits(date.getDate());
        return year + "-" + month + "-" + day;
    }

    /**
     * 
     * @param timeSeparator 
     * @param millisecondsEnabled 
     * @returns Current time in format 20:05:36
     */
    public static getTimestamp(timeSeparator = ":", millisecondsEnabled = false): string {
        const date = new Date();
        return TimeUtil.getTimestampFromDate(date, timeSeparator, millisecondsEnabled);
    }

    public static getTimestampFromDate(date: Date, timeSeparator = ":", millisecondsEnabled = false): string {
        let timestapm = TimeUtil.toTwoDigits(date.getHours()) + timeSeparator
            + TimeUtil.toTwoDigits(date.getMinutes()) + timeSeparator
            + TimeUtil.toTwoDigits(date.getSeconds());
        if (millisecondsEnabled) timestapm += timeSeparator + date.getMilliseconds();
        return timestapm;
    }

    public static toTwoDigits(val: number): string {
        return val > 9 ? val.toString() : "0" + val;
    }

    public static secondsToCounter(seconds: number): string {
        const hour: string = TimeUtil.toTwoDigits(Math.floor(seconds / 3600));
        const minute: string = TimeUtil.toTwoDigits(Math.floor(seconds / 60) % 60);
        const second: string = TimeUtil.toTwoDigits(seconds % 60);
        return hour + ":" + minute + ":" + second;
    }

}