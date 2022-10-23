const getTagString = (tagSearchable: string | null | undefined) => {
  const regex = /지역_|요가_|규모_|기타_|대상_|필라테스_/g;

  const newString = tagSearchable ? tagSearchable.replace(regex, '') : '';

  return newString;
};

export default getTagString;
