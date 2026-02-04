import { Message } from 'src/chat/message.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @OneToMany(() => Message, (message) => message.user)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.targetUser)
  recevedMessages: Message[];
}
