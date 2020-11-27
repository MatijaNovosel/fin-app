import { IndexableCollectionByString } from "./indexable-collection-by-string";

export const stringFormatCollection: IndexableCollectionByString = {
  paymentSource: {
    CheckingAccount: "Tekući račun",
    GyroAccount: "Žiro račun",
    Pocket: "Džep"
  },
  category: {
    Food: "Hrana",
    Games: "Igre",
    Gifts: "Darovi",
    PublicTransport: "Javni prijevoz",
    Other: "Ostalo"
  }
};