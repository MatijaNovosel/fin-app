import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Appuser } from "./appuser";

@Entity("financialhistory", { schema: "finapp" })
export class Financialhistory {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  public id?: number;

  @Column("double", { name: "checking", nullable: true, precision: 22 })
  public checking?: number | null;

  @Column("date", { name: "createdAt", nullable: true })
  public createdAt?: string | null;

  @Column("double", { name: "euros", nullable: true, precision: 22 })
  public euros?: number | null;

  @Column("double", { name: "gyro", nullable: true, precision: 22 })
  public gyro?: number | null;

  @Column("double", { name: "pocket", nullable: true, precision: 22 })
  public pocket?: number | null;

  @ManyToOne(() => Appuser, (appuser) => appuser.financialhistories, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "appUserId", referencedColumnName: "id" }])
  public appUser?: Appuser;
}