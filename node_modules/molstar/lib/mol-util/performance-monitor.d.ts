import { now } from '../mol-util/now';
export declare class PerformanceMonitor {
    private starts;
    private ends;
    static currentTime(): now.Timestamp;
    start(name: string): void;
    end(name: string): void;
    static format(t: number): string;
    formatTime(name: string): string;
    formatTimeSum(...names: string[]): string;
    /** Returns the time in milliseconds and removes them from the cache. */
    time(name: string): number;
    timeSum(...names: string[]): number;
}
