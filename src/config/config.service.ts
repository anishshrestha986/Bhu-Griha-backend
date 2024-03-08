import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

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

  public getJwtConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      access: {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
      },
      refresh: {
        expiresIn: this.configService.get<string>('REFRESH_EXPIRATION_TIME'),
      },
    };
  }

  public getMailConfig() {
    return {
      transport: {
        host: this.configService.get<string>('MAIL_HOST'),
        port: this.configService.get<number>('MAIL_PORT'),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${this.configService.get<string>('MAIL_FROM')}>`,
      },
    } as SMTPTransport.Options;
  }

  public getCloudinaryConfig() {
    return {
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    };
  }
}
