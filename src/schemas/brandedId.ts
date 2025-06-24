import { z } from 'zod/v4';

const ID_NAME_LIST = ['did', 'vc'] as const;

type IdName = (typeof ID_NAME_LIST)[number];

type Entity<T extends IdName> = string & z.BRAND<`${T}EntityId`>;

type Dto<T extends IdName> = string & z.BRAND<`${T}DtoId`>;

export type EntityId = { [T in IdName]: Entity<T> };

export type DtoId = { [T in IdName]: Dto<T> };

export type MaybeId = { [T in IdName]: Dto<T> | (string & z.BRAND<`${T}MaybeId`>) };

export const brandedId = ID_NAME_LIST.reduce(
  (dict, current) => ({
    ...dict,
    [current]: { entity: z.string(), dto: z.string(), maybe: z.string() },
  }),
  {} as {
    [Name in (typeof ID_NAME_LIST)[number]]: {
      entity: z.ZodType<EntityId[Name]>;
      dto: z.ZodType<DtoId[Name]>;
      maybe: z.ZodType<MaybeId[Name]>;
    };
  },
);
