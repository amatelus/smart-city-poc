// https://zenn.dev/shoalwave/articles/527a539d3c7a01
type Diff<T extends keyof never, U extends T> = ({ [P in T]: P } & { [P in U]: never } & {
  [x: keyof never]: never;
})[T];

type Condition<T extends keyof never, R> = [T] extends [never] ? { done: R } : ConditionItem<T, R>;

type ConditionItem<T extends keyof never, R> = {
  case: <U extends T, A>(
    match: U | U[],
    callback: (matched: U) => A,
  ) => Condition<Diff<T, U>, R | A>;
  else: <A>(callback: (matched: T) => A) => R | A;
};

function includes<T extends ReadonlyArray<unknown>>(array: T, input: unknown): input is T[number] {
  return array.includes(input);
}

function isUnmatch<T extends keyof never, U extends T>(val: T, match: U | U[]): val is Diff<T, U> {
  return Array.isArray(match) ? !includes(match, val) : val !== match;
}

function matchedCondition<T extends keyof never, R>(result: R): Condition<T, R> {
  const conditionItem: ConditionItem<T, R> = {
    case: <U extends T, A>(_: U | U[], __: (_: U) => A) =>
      matchedCondition<Diff<T, U>, R | A>(result),
    else: <A>(_: (_: T) => A) => result,
  };

  return { ...conditionItem, ...{ done: result } };
}

function conditionBody<T extends keyof never, R>(val: T, result: R): Condition<T, R> {
  const conditionItem: ConditionItem<T, R> = {
    case: <U extends T, A>(match: U | U[], callback: (matched: U) => A) =>
      isUnmatch(val, match)
        ? conditionBody<Diff<T, U>, R | A>(val, result)
        : matchedCondition<Diff<T, U>, R | A>(callback(val as U)),
    else: <A>(callback: (matched: T) => A) => callback(val),
  };

  return { ...conditionItem, ...{ done: result } };
}

export function condition<T extends keyof never>(val: T): Condition<T, never> {
  return conditionBody(val, undefined as never);
}

type ExtractType<T, K extends keyof T, U> = T extends Record<K, U> ? T : never;

type ConditionUnion<T, K extends keyof T, R> = [T] extends [never]
  ? { done: R }
  : ConditionUnionItem<T, K, R>;

type ConditionUnionItem<T, K extends keyof T, R> = {
  case: <U extends T[K], A>(
    match: U | U[],
    callback: (matched: ExtractType<T, K, U>) => A,
  ) => ConditionUnion<Exclude<T, ExtractType<T, K, U>>, K, R | A>;
  else: <A>(callback: (matched: T) => A) => R | A;
};

function isUnmatchUnion<T, K extends keyof T, U extends T[K]>(
  val: T,
  key: K,
  match: U | U[],
): val is Exclude<T, ExtractType<T, K, U>> {
  return Array.isArray(match) ? !(match as T[K][]).includes(val[key]) : val[key] !== match;
}

function matchedConditionUnion<T, K extends keyof T, R>(result: R): ConditionUnion<T, K, R> {
  const conditionItem: ConditionUnionItem<T, K, R> = {
    case: <U extends T[K], A>(_: U | U[], __: (_: ExtractType<T, K, U>) => A) =>
      matchedConditionUnion<Exclude<T, ExtractType<T, K, U>>, K, R | A>(result),
    else: <A>(_: (_: T) => A) => result,
  };
  return { ...conditionItem, ...{ done: result } };
}

function conditionUnionBody<T, K extends keyof T, R>(
  val: T,
  key: K,
  result: R,
): ConditionUnion<T, K, R> {
  const conditionItem: ConditionUnionItem<T, K, R> = {
    case: <U extends T[K], A>(match: U | U[], callback: (matched: ExtractType<T, K, U>) => A) =>
      isUnmatchUnion(val, key, match)
        ? conditionUnionBody<Exclude<T, ExtractType<T, K, U>>, K, R | A>(val, key, result)
        : matchedConditionUnion<Exclude<T, ExtractType<T, K, U>>, K, R | A>(
            callback(val as ExtractType<T, K, U>),
          ),
    else: <A>(callback: (matched: T) => A) => callback(val),
  };
  return { ...conditionItem, ...{ done: result } };
}

export function conditionUnion<T, K extends keyof T>(val: T, key: K): ConditionUnion<T, K, never> {
  return conditionUnionBody(val, key, undefined as never);
}
