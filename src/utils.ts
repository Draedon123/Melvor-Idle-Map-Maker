export function chunkData<T>(array: T[], chunks: number): T[][]{
  const chunkedData: T[][] = [];
  for(let i = chunks; i > 0; i--) chunkedData.push(array.splice(0, Math.ceil(array.length / i)));
  return chunkedData;
}

export function clamp(value: number, minimumValue: number, maximumValue: number): number{
  return Math.max(Math.min(value, maximumValue), minimumValue);
}