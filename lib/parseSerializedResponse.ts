import { ethers } from 'ethers';

export function parseSerializedResponse(jsonString: string) {
  const parsed = JSON.parse(jsonString);
  if (Array.isArray(parsed)) {
    return parsed.map(toObjectWithBigNumbers);
  }

  return toObjectWithBigNumbers(parsed);
}

/**
 * Given an object, return a new object with the same values, except all serialized BigNumbers are instantiated.
 * @param obj
 */
function toObjectWithBigNumbers(obj: { [key: string]: any }) {
  const result = Object.assign({}, obj);
  Object.keys(result).forEach((key) => {
    if (result[key] && result[key].hex) {
      result[key] = ethers.BigNumber.from(result[key]);
    }
  });
  return result;
}
