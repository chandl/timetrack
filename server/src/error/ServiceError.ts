export default class ServiceError {
  code: number;
  message: string;

  constructor({ code, message }) {
    this.code = code;
    this.message = message;
  }
}
