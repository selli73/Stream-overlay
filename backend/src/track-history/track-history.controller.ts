import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TrackHistoryService } from './track-history.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('/api/history')
export class TrackHistoryController {
  constructor(private readonly trackHistoryService: TrackHistoryService) {}

  @Get('/:spotifyUserId')
  @ApiOperation({ summary: 'Get the streams tracklist' })
  @ApiResponse({ status: 200, description: 'Tracklist for the current or last completed stream retrieved.' }) @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStreamTracks(@Param('spotifyUserId') spotifyUserId: string, @Query('page', ParseIntPipe) page: number, @Query('limit', ParseIntPipe) limit: number) {
    return this.trackHistoryService.getStreamTracks(spotifyUserId, page, limit);
  }
}
