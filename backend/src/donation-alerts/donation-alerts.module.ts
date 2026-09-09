import { Module } from '@nestjs/common';
import { DonationAlertsService } from './donation-alerts.service';
import { DonationAlertsController } from './donation-alerts.controller';
import { AuthModule } from '../user/auth.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { PollingModule } from '../polling/polling.module';

@Module({
    imports: [AuthModule, SpotifyModule, PollingModule],
    controllers: [DonationAlertsController],
    providers: [DonationAlertsService]    
})
export class DonationAlertsModule {}
