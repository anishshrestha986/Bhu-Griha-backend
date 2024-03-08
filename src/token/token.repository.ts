import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { ITokenModel, ITokenDocument } from '@interfaces/entities';
import { Token } from '@/entities/token.entity';
import { CreateTokenDto } from './dto/createToken.dto';
import { TOKEN_TYPE } from '@enums';

export class TokenRepository {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: ITokenModel,
  ) {}

  async createToken(createTokenDto: CreateTokenDto, session?: ClientSession) {
    await this.tokenModel.deleteMany(
      {
        user: new Types.ObjectId(createTokenDto.user),
        tokenType: createTokenDto.tokenType,
      },
      { session },
    );

    const token = new this.tokenModel(createTokenDto);

    return token.save({ session });
  }

  async getUserToken(userId: string, tokenType: TOKEN_TYPE) {
    const token: ITokenDocument = await this.tokenModel.findOne({
      user: new Types.ObjectId(userId),
      tokenType,
    });
    return token;
  }

  async deleteToken(tokenId: string, session?: ClientSession) {
    const token: ITokenDocument = await this.tokenModel.findByIdAndDelete(
      tokenId,
      { session },
    );
    return token;
  }
}
