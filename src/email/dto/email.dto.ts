export class EmailDto {
  readonly email: string;
  readonly subject: string;
  readonly template: string;
  readonly context?: Record<string, any>;
}
