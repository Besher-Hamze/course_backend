import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TeachersService } from 'src/teachers/teachers.service';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(private readonly teachersService: TeachersService) { }

    async onModuleInit() {
        const username = process.env.OWNER_USERNAME || 'owner';
        const password = process.env.OWNER_PASSWORD || 'owner';
        const fullName = process.env.OWNER_FULLNAME || 'Platform Owner';

        // Ensure an owner teacher exists
        const existing = await this.teachersService.findByUsername(username);
        if (!existing) {
            const created = await this.teachersService.create(username, fullName, password);
            // promote to owner
            await this.teachersService.setActive(created._id.toString(), true);
            // direct model update for isOwner
            (created as any).isOwner = true;
            await (created as any).save();
            this.logger.log(`Seeded owner account '${username}'.`);
        } else if (!(existing as any).isOwner) {
            (existing as any).isOwner = true;
            await (existing as any).save();
            this.logger.log(`Updated '${username}' to owner.`);
        } else {
            this.logger.log('Owner already seeded.');
        }
    }
}


