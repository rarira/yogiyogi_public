import { SearchableConvSortableFields, SearchableSortDirection } from '../API';

export const searchChatroomLimitSize = 30;

export const getSearchChatroomQueryInput = (
  username: string | null,
  classId: string | null,
  allChat: boolean | undefined,
) => {
  if (username)
    return {
      filter: {
        ...(!allChat && {
          and: [
            { user1exited: { ne: username } },
            { user2exited: { ne: username } },
            // { or: [{ convUser1Id: { eq: username } }, { convUser2Id: { eq: username } }] },
          ],
        }),

        or: [{ convUser1Id: { eq: username } }, { convUser2Id: { eq: username } }],
      },
      limit: searchChatroomLimitSize,
      sort: {
        field: SearchableConvSortableFields.createdAt,
        direction: SearchableSortDirection.desc,
      },
    };
  if (classId)
    return {
      filter: { and: [{ convOnClassId: { eq: classId } }] },
      limit: searchChatroomLimitSize,
      sort: {
        field: SearchableConvSortableFields.createdAt,
        direction: SearchableSortDirection.asc,
      },
    };
};
