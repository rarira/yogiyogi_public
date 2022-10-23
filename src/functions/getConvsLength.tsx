const getConvsLength = (convs: any) => {
  if (convs.nextToken) {
    return '20+';
  }
  return convs.items.length;
};

export default getConvsLength;
