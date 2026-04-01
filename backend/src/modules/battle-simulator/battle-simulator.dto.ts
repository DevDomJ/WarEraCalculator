import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsObject, Min, Max, ValidateNested, ValidateIf, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

class EquipmentSlotDto {
  @ValidateIf(o => o.code !== null)
  @IsString()
  code: string | null;

  @IsObject()
  @IsOptional()
  stats?: Record<string, number>;
}

class ConsumablesDto {
  @IsEnum(['none', 'lightAmmo', 'ammo', 'heavyAmmo'])
  ammo: 'none' | 'lightAmmo' | 'ammo' | 'heavyAmmo';

  @IsBoolean()
  pill: boolean;

  @IsEnum(['bread', 'steak', 'cookedFish'])
  food: 'bread' | 'steak' | 'cookedFish';
}

class EquipmentDto {
  @ValidateNested() @Type(() => EquipmentSlotDto)
  weapon: EquipmentSlotDto;
  @ValidateNested() @Type(() => EquipmentSlotDto)
  helmet: EquipmentSlotDto;
  @ValidateNested() @Type(() => EquipmentSlotDto)
  chest: EquipmentSlotDto;
  @ValidateNested() @Type(() => EquipmentSlotDto)
  pants: EquipmentSlotDto;
  @ValidateNested() @Type(() => EquipmentSlotDto)
  boots: EquipmentSlotDto;
  @ValidateNested() @Type(() => EquipmentSlotDto)
  gloves: EquipmentSlotDto;
}

class BuildDto {
  @IsObject()
  skills: Record<string, number>;

  @ValidateNested() @Type(() => EquipmentDto)
  equipment: EquipmentDto;

  @ValidateNested() @Type(() => ConsumablesDto)
  consumables: ConsumablesDto;
}

export class SimulateDto {
  @ValidateNested() @Type(() => BuildDto)
  build: BuildDto;

  @IsNumber() @Min(0)
  militaryRank: number;

  @IsNumber()
  militaryRankPercent: number;

  @IsEnum(['burst', '8h', '24h'])
  duration: 'burst' | '8h' | '24h';

  @IsNumber() @Min(0)
  bountyPer1kDmg: number;

  @IsNumber() @Min(-100) @Max(200)
  battleBonusPercent: number;

  @IsNumber() @IsOptional()
  seed?: number;
}

class NamedBuildDto {
  @IsString()
  name: string;

  @ValidateNested() @Type(() => BuildDto)
  build: BuildDto;
}

export class CompareDto {
  @IsArray() @ArrayMinSize(2) @ArrayMaxSize(10)
  @ValidateNested({ each: true }) @Type(() => NamedBuildDto)
  builds: NamedBuildDto[];

  @IsNumber() @Min(0)
  militaryRank: number;

  @IsNumber()
  militaryRankPercent: number;

  @IsEnum(['burst', '8h', '24h'])
  duration: 'burst' | '8h' | '24h';

  @IsNumber() @Min(0)
  bountyPer1kDmg: number;

  @IsNumber() @Min(-100) @Max(200)
  battleBonusPercent: number;

  @IsNumber() @IsOptional()
  seed?: number;
}
