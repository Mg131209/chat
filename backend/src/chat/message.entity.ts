import { User } from 'src/user/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false })
  user: User;

  @ManyToOne(() => User, (user) => user.recevedMessages, { nullable: false })
  targetUser: User;
}
