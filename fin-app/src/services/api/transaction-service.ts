import { CreateTransferDto } from './../../models/change-item';
import { ItemCollection } from "../../models/item-collection";
import {
  CreateFinancialChangeItemDto,
  FinancialChangeItem
} from "@/models/change-item";
import { FinancialHistory } from "@/models/history-item";
import axios from "axios";
import environmentVariables from "@/constants/environment-variables.json";
import { IChangeService } from "../interfaces/transaction-service";
import { format } from "date-fns";

export class ChangeService implements IChangeService {
  async getRecentWithdrawals(appUserId: number): Promise<number> {
    const { data: { data: { recentWithdrawals } } } = await axios.post(environmentVariables.apiUrl, {
      query: `
        query {
          recentWithdrawals(id: ${appUserId})
        }
      `
    });
    return recentWithdrawals;
  }

  async getRecentGains(appUserId: number): Promise<number> {
    const { data: { data: { recentGains } } } = await axios.post(environmentVariables.apiUrl, {
      query: `
        query {
          recentGains(id: ${appUserId})
        }
      `
    });
    return recentGains;
  }

  async transfer(payload: CreateTransferDto): Promise<void> {
    const {
      appUserId,
      amount,
      accountFromId,
      accountToId
    } = payload;

    await axios.post(environmentVariables.apiUrl, {
      query: `
        mutation {
          transfer(
            transfer: {
              appUserId: ${appUserId}
              amount: ${amount}
              accountFromId: ${accountFromId}
              accountToId: ${accountToId}
            }
          )
        }
      `
    });
  }

  async addChange(payload: CreateFinancialChangeItemDto): Promise<void> {
    const {
      appUserId,
      amount,
      description,
      expense,
      paymentSourceId,
      tagIds
    } = payload;

    await axios.post(environmentVariables.apiUrl, {
      query: `
        mutation {
          addFinancialChange(
            financialChange: {
              appUserId: ${appUserId}
              amount: ${amount}
              description: "${description}"
              expense: ${expense}
              paymentSourceId: ${paymentSourceId}
              tagIds: [${tagIds.join(",")}]
            }
          )
        }
      `
    });
  }
  
  async getChanges(
    appUserId: number,
    skip?: number,
    take?: number
  ): Promise<ItemCollection<FinancialChangeItem>> {
    const { data: { data: { financialChanges } } } = await axios.post(environmentVariables.apiUrl, {
      query: `
        query {
          financialChanges(id: ${appUserId}, take: ${take || null}, skip: ${skip || null}) {
            count
            items {
              id
              amount
              transfer
              createdAt
              description
              expense
              paymentSourceId
              tagIds
            }
          }
        }
      `
    });
    return financialChanges;
  }

  async getHistory(appUserId: number, from: Date, to: Date): Promise<FinancialHistory[]> {
    const { data: { data: { financialHistory } } } = await axios.post(environmentVariables.apiUrl, {
      query: `
        query {
          financialHistory(id: ${appUserId}, from: "${format(from, "yyyy-MM-dd HH:mm:ss")}", to: "${format(to, "yyyy-MM-dd HH:mm:ss")}") {
            createdAt
            paymentSources {
              id
              amount
            }
            total
          }
        }
      `
    });
    return financialHistory;
  }
}