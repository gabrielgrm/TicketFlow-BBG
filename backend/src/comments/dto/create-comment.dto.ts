import { IsString, MinLength } from 'class-validator';
import { COMMENT } from '../../common/constants';

export class CreateCommentDto {
  @IsString()
  @MinLength(COMMENT.MIN_CONTENT_LENGTH)
  content: string;
}
