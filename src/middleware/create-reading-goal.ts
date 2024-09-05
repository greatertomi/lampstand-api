import { IsInt, IsString, Min, Matches } from 'class-validator';

export class CreateReadingGoal {
  @IsInt()
  @Min(1)
  goalInMinutes: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'reminderTime must be in HH:MM format'
  })
  reminderTime: string;
}
