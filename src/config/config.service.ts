import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomConfigService {
  constructor(private configService: ConfigService) {}

  public getMongoConfig() {
    const mongoOptions = this.configService.get<string>('MONGO_OPTIONS') || '';
    return {
      uri:
        this.configService.get<string>('MONGO_PROTOCOL') +
        this.configService.get<string>('MONGO_USER') +
        ':' +
        this.configService.get<string>('MONGO_PASSWORD') +
        '@' +
        this.configService.get<string>('MONGO_HOST') +
        '/' +
        this.configService.get<string>('MONGO_DATABASE') +
        '?retryWrites=true&w=majority' +
        (mongoOptions ? `&${mongoOptions}` : ''),
    };
  }
}
