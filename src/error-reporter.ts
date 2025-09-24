export class ErrorReporter {
  hadError: boolean;
  constructor() {
    this.hadError = false;
  }

  error(line, message) {
    this.report(line, '', message);
    this.hadError = true;
  }

  report(line, where, message) {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}
