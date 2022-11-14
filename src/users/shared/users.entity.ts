import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 15 })
  govId: string;

  @Column()
  balance: GLfloat;

  @Column({ length: 255 })
  password: string;

  constructor(user?: Partial<Users>) {
    this.id = user?.id;
    this.name = user?.name;
    this.govId = user?.govId;
    this.balance = user?.balance;
    this.password = user?.password;
  }
}