import { Financialhistory } from './../entities/financialhistory';
import { Paymentsource } from "./../entities/paymentsource";
import { Financialchangetag } from "./../entities/financialchangetag";
import { Tag } from "./../entities/tag";
import { Financialchange } from "./../entities/financialchange";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getRepository, Repository } from "typeorm";
import { FinancialChangeInputType } from "src/input-types/financial-change.input-type";
import { format } from "date-fns";
import { PaymentSourceEnum } from 'src/constants/payment-source';

@Injectable()
export class FinancialChangeService {
  constructor(
    @InjectRepository(Financialchange)
    private financialChangeRepository: Repository<Financialchange>,
    @InjectRepository(Financialchangetag)
    private financialChangeTagRepository: Repository<Financialchangetag>
    @InjectRepository(Financialchangetag)
    private financialChangeHistoryRepository: Repository<Financialhistory>
  ) {}

  async findAll(): Promise<Financialchange[]> {
    return await this.financialChangeRepository.find();
  }

  async getFinancialChangeTags(id: number): Promise<Tag[]> {
    /*

      SELECT t.id, t.description FROM tag AS t
      INNER JOIN financialchangetag AS fct ON fct.tagId = t.id
      WHERE fct.financialChangeId = {id}

    */
    return await getRepository(Tag)
      .createQueryBuilder("t")
      .innerJoin(Financialchangetag, "fct", "fct.tagId = t.id")
      .where("fct.financialChangeId = :id", { id })
      .getMany();
  }

  async getPaymentSource(id: number): Promise<Paymentsource> {
    return (
      await this.financialChangeRepository.findOne({
        relations: ["paymentSource"],
        where: { id }
      })
    ).paymentSource;
  }

  async create(payload: FinancialChangeInputType): Promise<void> {
    const financialChange = await this.financialChangeRepository.save({
      amount: payload.amount,
      description: payload.description,
      expense: payload.expense,
      paymentSourceId: payload.paymentSource.id,
      createdAt: format(new Date(), "yyyy-MM-dd")
    });

    payload.tags.forEach(async (tag) => {
      await this.financialChangeTagRepository.save({
        financialChangeId: financialChange.id,
        tagId: tag.id
      });
    });

    const currentAmount: Financialhistory = await getRepository(Financialhistory)
    .createQueryBuilder("fh")
    .orderBy("fh.createdAt", "ASC")
    .getOne();

    const historyEntry: Financialhistory = {
      checking: payload.paymentSource.id == PaymentSourceEnum.Checking ? parseFloat((currentAmount.checking - payload.amount).toFixed(2)) : currentAmount.checking,
      euros: currentAmount.euros,
      gyro: payload.paymentSource.id == PaymentSourceEnum.Gyro ? parseFloat((currentAmount.gyro - payload.amount).toFixed(2)) : currentAmount.gyro,
      pocket: payload.paymentSource.id == PaymentSourceEnum.Pocket ? parseFloat((currentAmount.pocket - payload.amount).toFixed(2)) : currentAmount.pocket,
      createdAt: format(new Date(), "yyyy-MM-dd")
    };

    await this.financialChangeHistoryRepository.save(historyEntry);
  }
}
