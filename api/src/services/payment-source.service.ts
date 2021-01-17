import { GLatestAccountValue, GPaymentSource } from "./../entities/paymentsource";
import { Paymentsource } from "../entities/paymentsource";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createQueryBuilder, Repository } from "typeorm";
import { format } from "date-fns";

@Injectable()
export class PaymentSourceService {
  constructor(
    @InjectRepository(Paymentsource)
    private paymentSourceRepository: Repository<Paymentsource>
  ) {}

  async getLatestValues(appUserId: number): Promise<GLatestAccountValue[]> {
    const maxDate = await createQueryBuilder("financialhistory")
      .select("MAX(createdAt)", "maxDate")
      .getRawOne();

    const res = await createQueryBuilder("financialhistory")
      .select("amount")
      .addSelect("description")
      .addSelect("icon")
      .addSelect("currency")
      .innerJoin("paymentsource", "ps", "ps.id = paymentSourceId")
      .where(
        `createdAt IN ('${format(maxDate.maxDate, "yyyy-MM-dd HH:mm:ss")}')`
      )
      .getRawMany();

    return res.map((x) => ({
      ...x
    }));
  }

  async findAllByUserId(appUserId: number): Promise<GPaymentSource[]> {
    return (
      await this.paymentSourceRepository.find({ where: { appUserId } })
    ).map(
      (x) =>
        ({
          appUserId,
          currency: x.currency,
          description: x.description,
          icon: x.icon,
          id: x.id
        } as GPaymentSource)
    );
  }

  async create(): Promise<void> {
    //
  }
}
