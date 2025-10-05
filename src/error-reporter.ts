export class ErrorReporter {
  hadError: boolean;
  constructor() {
    this.hadError = false;
  }

  error(line: number, message: string) {
    this.report(line, '', message);
    this.hadError = true;
  }

  report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}
