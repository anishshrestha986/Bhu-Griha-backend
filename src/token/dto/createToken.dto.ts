import { IsNotEmpty, IsString } from 'class-validator';
import { TOKEN_TYPE } from '@enums';

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  tokenType: TOKEN_TYPE;
}
