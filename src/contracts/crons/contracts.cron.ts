import { Cron, CronExpression } from '@nestjs/schedule/dist';
import { ContractStatus } from 'generated/prisma/enums';
import { DatabaseService } from 'src/database/database.service';

export class ContractsCron {
  constructor(private readonly databaseService: DatabaseService) {}

  @Cron(CronExpression.EVERY_2ND_MONTH)
  async checkExpiring() {
    const thirtyDaysFromNow = new Date();

    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringContracts = await this.databaseService.contract.findMany({
      where: {
        status: ContractStatus.ACTIVE,
        endDate: {
          lte: thirtyDaysFromNow,
        },
        expiryAlertSent: false,
      },
      include: { employee: true },
    });
    for (const contract of expiringContracts) {
      // TODO: Send notification to HR / Admin about expiring contract
      console.log(
        `Contract ${contract.uuid} for employee ${contract.employee.firstName} is expiring soon.`,
      );
      await this.databaseService.contract.update({
        where: { uuid: contract.uuid },
        data: { expiryAlertSent: true },
      });
    }
  }
}
