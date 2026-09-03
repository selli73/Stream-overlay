import { Module } from '@nestjs/common';
import { TrackHistoryService } from './track-history.service';
import { TrackHistoryController } from './track-history.controller';
import { AuthModule } from '../user/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TrackHistoryController],
  providers: [TrackHistoryService],
  exports: [TrackHistoryService]
})
export class TrackHistoryModule {}
