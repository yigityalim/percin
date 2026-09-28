import type { DigestAlgorithm, InputValue } from "./types.js"

export type Presence = "implicit" | "optional" | "required" | "defaulted"
type ValueKind = "string" | "path" | "choice" | "number" | "flag"

declare const outputType: unique symbol
declare const presenceType: unique symbol

export interface RuntimeValueSpec {
  readonly kind: ValueKind
  readonly presence: Presence
  readonly description?: string
  readonly short?: string
  readonly defaultValue?: InputValue
  readonly choices?: readonly string[]
  readonly pathMustExist?: boolean
}

export type InferArgument<TValue extends ValueBuilder<InputValue, Presence>> =
  TValue[typeof presenceType] extends "optional"
    ? TValue[typeof outputType] | undefined
    : TValue[typeof outputType]

export type InferOption<TValue extends ValueBuilder<InputValue, Presence>> =
  TValue[typeof presenceType] extends "required" | "defaulted"
    ? TValue[typeof outputType]
    : TValue[typeof outputType] | undefined

export class ValueBuilder<T extends InputValue, P extends Presence = "implicit"> {
  declare readonly [outputType]: T
  declare readonly [presenceType]: P
  protected readonly spec: RuntimeValueSpec

  constructor(spec: RuntimeValueSpec) {
    this.spec = spec
  }

  describe(description: string): ValueBuilder<T, P> {
    return this.clone({ ...this.spec, description })
  }

  short(short: string): ValueBuilder<T, P> {
    if (short.length !== 1 || short === "-") {
      throw new Error("Short option names must contain exactly one character")
    }

    return this.clone({ ...this.spec, short })
  }

  optional(): ValueBuilder<T, "optional"> {
    return this.clone({ ...this.spec, presence: "optional" })
  }

  required(): ValueBuilder<T, "required"> {
    return this.clone({ ...this.spec, presence: "required" })
  }

  default(value: T): ValueBuilder<T, "defaulted"> {
    return new ValueBuilder<T, "defaulted">({
      ...this.spec,
      presence: "defaulted",
      defaultValue: value,
    })
  }

  runtime(): RuntimeValueSpec {
    return this.spec
  }

  protected clone<TNext extends InputValue = T, PNext extends Presence = P>(
    spec: RuntimeValueSpec,
  ): ValueBuilder<TNext, PNext> {
    return new ValueBuilder<TNext, PNext>(spec)
  }
}

export class PathBuilder<P extends Presence = "implicit"> extends ValueBuilder<string, P> {
  exists(): PathBuilder<P> {
    return new PathBuilder<P>({
      ...this.spec,
      pathMustExist: true,
    })
  }

  override describe(description: string): PathBuilder<P> {
    return new PathBuilder<P>({ ...this.spec, description })
  }

  override short(short: string): PathBuilder<P> {
    if (short.length !== 1 || short === "-") {
      throw new Error("Short option names must contain exactly one character")
    }

    return new PathBuilder<P>({ ...this.spec, short })
  }

  override optional(): PathBuilder<"optional"> {
    return new PathBuilder<"optional">({ ...this.spec, presence: "optional" })
  }

  override required(): PathBuilder<"required"> {
    return new PathBuilder<"required">({ ...this.spec, presence: "required" })
  }

  override default(value: string): PathBuilder<"defaulted"> {
    return new PathBuilder<"defaulted">({
      ...this.spec,
      presence: "defaulted",
      defaultValue: value,
    })
  }
}

export class ChoiceBuilder<T extends string, P extends Presence = "implicit"> extends ValueBuilder<
  T,
  P
> {
  override describe(description: string): ChoiceBuilder<T, P> {
    return new ChoiceBuilder<T, P>({ ...this.spec, description })
  }

  override short(short: string): ChoiceBuilder<T, P> {
    if (short.length !== 1 || short === "-") {
      throw new Error("Short option names must contain exactly one character")
    }

    return new ChoiceBuilder<T, P>({ ...this.spec, short })
  }

  override optional(): ChoiceBuilder<T, "optional"> {
    return new ChoiceBuilder<T, "optional">({ ...this.spec, presence: "optional" })
  }

  override required(): ChoiceBuilder<T, "required"> {
    return new ChoiceBuilder<T, "required">({ ...this.spec, presence: "required" })
  }

  override default(value: T): ChoiceBuilder<T, "defaulted"> {
    return new ChoiceBuilder<T, "defaulted">({
      ...this.spec,
      presence: "defaulted",
      defaultValue: value,
    })
  }
}

class NumberBuilder<P extends Presence = "implicit"> extends ValueBuilder<number, P> {
  override describe(description: string): NumberBuilder<P> {
    return new NumberBuilder<P>({ ...this.spec, description })
  }

  override short(short: string): NumberBuilder<P> {
    if (short.length !== 1 || short === "-") {
      throw new Error("Short option names must contain exactly one character")
    }

    return new NumberBuilder<P>({ ...this.spec, short })
  }

  override optional(): NumberBuilder<"optional"> {
    return new NumberBuilder<"optional">({ ...this.spec, presence: "optional" })
  }

  override required(): NumberBuilder<"required"> {
    return new NumberBuilder<"required">({ ...this.spec, presence: "required" })
  }

  override default(value: number): NumberBuilder<"defaulted"> {
    return new NumberBuilder<"defaulted">({
      ...this.spec,
      presence: "defaulted",
      defaultValue: value,
    })
  }
}

export class FlagBuilder extends ValueBuilder<boolean, "defaulted"> {
  override describe(description: string): FlagBuilder {
    return new FlagBuilder({ ...this.spec, description })
  }

  override short(short: string): FlagBuilder {
    if (short.length !== 1 || short === "-") {
      throw new Error("Short option names must contain exactly one character")
    }

    return new FlagBuilder({ ...this.spec, short })
  }
}

export function string(): ValueBuilder<string> {
  return new ValueBuilder<string>({
    kind: "string",
    presence: "implicit",
  })
}

export function path(): PathBuilder {
  return new PathBuilder({
    kind: "path",
    presence: "implicit",
  })
}

export function choice<const T extends readonly [string, ...string[]]>(
  values: T,
): ChoiceBuilder<T[number]> {
  return new ChoiceBuilder<T[number]>({
    kind: "choice",
    presence: "implicit",
    choices: values,
  })
}

export function number(): NumberBuilder {
  return new NumberBuilder({
    kind: "number",
    presence: "implicit",
  })
}

export function flag(): FlagBuilder {
  return new FlagBuilder({
    kind: "flag",
    presence: "defaulted",
    defaultValue: false,
  })
}

export const digestAlgorithm = choice(["sha256", "sha384", "sha512"] satisfies readonly [
  DigestAlgorithm,
  ...DigestAlgorithm[],
])
