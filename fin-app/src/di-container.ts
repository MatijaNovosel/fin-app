import { Container } from "inversify";
import "reflect-metadata";
import { PaymentSourceService } from "./services/api/payment-source-service";
import { IPaymentSourceService } from "./services/interfaces/payment-source-service";
import { SettingsService } from "./services/api/settings-service";
import { ISettingsService } from "./services/interfaces/settings-service";
import { AuthService } from "./services/api/auth-service";
import { IAuthService } from "./services/interfaces/auth-service";
import { ITransactionService } from "./services/interfaces/transaction-service";
import { ChangeService } from "./services/api/transaction-service";

export class Types {
  static readonly AuthService = Symbol("IAuthService");
  static readonly ChangeService = Symbol("ITransactionService");
  static readonly SettingsService = Symbol("ISettingsService");
  static readonly PaymentSourceService = Symbol("IPaymentSourceService");
}

const DIContainer = new Container();

DIContainer.bind<IAuthService>(Types.AuthService).toConstantValue(
  new AuthService()
);

DIContainer.bind<ITransactionService>(Types.ChangeService).toConstantValue(
  new ChangeService()
);

DIContainer.bind<ISettingsService>(Types.SettingsService).toConstantValue(
  new SettingsService()
);

DIContainer.bind<IPaymentSourceService>(
  Types.PaymentSourceService
).toConstantValue(new PaymentSourceService());

export function getService<T>(symbol: symbol): T {
  return DIContainer.get<T>(symbol);
}

export default DIContainer;
