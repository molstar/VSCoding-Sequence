type ReaderResult<T> = ReaderResult.Success<T> | ReaderResult.Error;
declare namespace ReaderResult {
    function error<T>(message: string, line?: number): ReaderResult<T>;
    function success<T>(result: T, warnings?: string[]): ReaderResult<T>;
    class Error {
        message: string;
        line: number;
        isError: true;
        toString(): string;
        constructor(message: string, line: number);
    }
    class Success<T> {
        result: T;
        warnings: string[];
        isError: false;
        constructor(result: T, warnings: string[]);
    }
}
export { ReaderResult };
