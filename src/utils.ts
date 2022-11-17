export function pop(array: Array<any>) {
  return array.filter((_, index: number) => {
    return index < array.length - 1
  })
};