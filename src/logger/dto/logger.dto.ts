export class LoggerDto {
  readonly message: string;
  readonly context?: {
    service: string;
    method: string;
  };
  readonly trace?: string;
  readonly payload?: {
    [key: string]: any;
  };
}
