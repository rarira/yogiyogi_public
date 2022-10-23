import {
  ClassStatusType,
  SearchableClassFilterInput,
  SearchableClassSortInput,
  SearchableClassSortableFields,
  SearchableSortDirection,
} from '../API';

import { ClassListTab } from '../stores/ClassStore';

const getClassListVariables = (username: string, type: string, tabLabel: string, sort: string) => {
  const tempObj: {
    filter: SearchableClassFilterInput;
    sort: SearchableClassSortInput;
    limit?: number;
    nextToken?: string;
  } = {
    filter: {},
    sort: { field: SearchableClassSortableFields.timeStart, direction: sort as SearchableSortDirection },
    limit: 20,
  };

  if (type === 'hosted') {
    tempObj.filter.classHostId = { eq: username };
  } else if (type === 'proxied') {
    tempObj.filter.classProxyId = { eq: username };
  } else if (tabLabel === ClassListTab.yet) {
    tempObj.filter.classProxyId = { eq: username };
  } else {
    tempObj.filter.classHostId = { eq: username };
  }

  switch (tabLabel) {
    case ClassListTab.on:
      tempObj.filter = {
        ...tempObj.filter,
        or: [{ classStatus: { eq: ClassStatusType.open } }, { classStatus: { eq: ClassStatusType.reserved } }],
      };
      break;
    case ClassListTab.closed:
      tempObj.filter = {
        ...tempObj.filter,
        or: [
          { classStatus: { eq: ClassStatusType.closed } },
          { classStatus: { eq: ClassStatusType.completed } },
          { classStatus: { eq: ClassStatusType.proxied } },
          { classStatus: { eq: ClassStatusType.reviewed } },
        ],
      };
      break;
    case ClassListTab.off:
      tempObj.filter = { ...tempObj.filter, classStatus: { eq: ClassStatusType.cancelled } };
      break;
    case ClassListTab.yet:
      tempObj.filter = { ...tempObj.filter, classStatus: { eq: ClassStatusType.proxied } };
      break;
    case ClassListTab.reviewed:
      tempObj.filter = { ...tempObj.filter, classStatus: { eq: ClassStatusType.reviewed } };
      break;
    case ClassListTab.toBeProxied:
      tempObj.filter = { ...tempObj.filter, classStatus: { eq: ClassStatusType.closed } };
      break;
    default:
      break;
  }
  return tempObj;
};

export default getClassListVariables;
