import { Module } from '@nestjs/common';
import { AccommodationsModule } from './accommodations/accommodations.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [AccountsModule, AccommodationsModule],
})
export class DomainsModule {}
