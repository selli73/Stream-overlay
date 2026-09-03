import { Controller, Get, Param } from '@nestjs/common';
import { TrackHistoryService } from './track-history.service';

@Controller('/api/history')
export class TrackHistoryController {
  constructor(private readonly trackHistoryService: TrackHistoryService) {}

  @Get('/:spotifyUserId')
  getStreamTracks(@Param('spotifyUserId') spotifyUserId: string) {
    return this.trackHistoryService.getStreamTracks(spotifyUserId);
  }
}
