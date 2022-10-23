import differenceWith from 'lodash/differenceWith';

const getArrayBeforeAfter = (beforeArray: string[], afterArray: string[]) => {
  let toAdd: string[] = [];
  let toDelete: string[] = [];

  if (afterArray.length !== 0) {
    toAdd = differenceWith(afterArray, beforeArray, (arrVal: string, othVal: any) => arrVal === othVal);
  }

  if (beforeArray.length !== 0) {
    toDelete = differenceWith(beforeArray, afterArray, (arrVal: any, othVal: string) => arrVal === othVal);
  }

  return { toAdd, toDelete };
};

export default getArrayBeforeAfter;
