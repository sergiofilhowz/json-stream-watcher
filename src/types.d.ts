type ArrayIndex = `${number}` | `*`

export type NestedKeys<Type> =
  Type extends Array<infer ArrayItem>
    ? NestedArray<ArrayItem>
    : Type extends object
      ? {
          [Key in keyof Type]: Type[Key] extends Array<infer ArrayItem>
            ? Key extends string
              ? `${Key}` | `${Key}${NestedArray<ArrayItem>}`
              : never
            : Type[Key] extends object
              ? Key extends string
                ? `${Key}` | `${Key}.${NestedKeys<Type[Key]>}`
                : never
              : Key extends string
                ? `${Key}`
                : never
        }[keyof Type]
      : Type extends string | boolean | number
        ? `${Type}`
        : never

type NestedArray<ArrayItem> =
  ArrayItem extends Array<infer ArraySubItem>
    ? `[${number}]${NestedArray<ArraySubItem>}` | `[*]${NestedArray<ArraySubItem>}` | `[${number}]` | `[*]`
    : ArrayItem extends object
      ? `[${ArrayIndex}].${NestedKeys<ArrayItem>}` | `[${ArrayIndex}]`
      : `[${ArrayIndex}]`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Observer = (prop: any) => void
