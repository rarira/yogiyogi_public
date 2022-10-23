export const customListMyCentersByUser = `query ListMyCentersByUser(
  $myCenterUserId: String
  $createdAt: ModelStringKeyConditionInput
  $filter: ModelMyCenterFilterInput
  $limit: Int
  $nextToken: String
) {
  listMyCentersByUser(
    myCenterUserId: $myCenterUserId
    createdAt: $createdAt
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      __typename
      id
      createdAt
      center {
        id
        name
        address
      }
    }
    nextToken
  }
}
`;

export const customListTags = `query ListTags($filter: ModelTagFilterInput, $limit: Int, $nextToken: String) {
  listTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      __typename
      id
      type
      category1
      category2
      category3
      taggedClassCounter
	    subscriberCounter
    }
    nextToken
  }
}
`;

export const customCreateClass = `mutation CreateClass($input: CreateClassInput!) {
  createClass(input: $input) {
     __typename
    id
    title
    center {
      __typename
      id
      name
    }
    dateStart
    dateEnd
    dayOfWeek
    timeStart
    timeEnd
    numOfClass
    classFee
    host {
      __typename
      id
      name
    }
    memo
    classStatus
    createdAt
    updateCounter
  }
}
`;

export const customCreateClassAndNoti = `mutation CreateClassAndNoti($input: CreateClassAndNotiInput) {
  createClassAndNoti(input: $input) {
    __typename
    id
    title
    center {
      __typename
      id
      name
    }
    dateStart
    dateEnd
    dayOfWeek
    timeStart
    timeEnd
    numOfClass
    classFee
    host {
      __typename
      id
      name
    }
    memo
    classStatus
    createdAt
    updateCounter
  }
}
`;

export const customSearchClasss = `query SearchClasss(
  $filter: SearchableClassFilterInput
  $sort: SearchableClassSortInput
  $limit: Int
  $nextToken: String
) {
  searchClasss(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      __typename
      id
      title
      dateStart
      timeStart
      host {
        __typename
        id
      }
      classFee
      createdAtEpoch
      tagSearchable
      regionSearchable
      classStatus
      convs {
        items {
          id
        }
        nextToken
      }
    }
    nextToken
  }
}
`;

export const customKeywordClasss = `query SearchClasss(
  $filter: SearchableClassFilterInput
  $sort: SearchableClassSortInput
  $limit: Int
  $nextToken: String
) {
  searchClasss(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      __typename
      id
      title
      classHostId
      firstCreatedAt
      firstCreatedAtEpoch
      tagSearchable
      regionSearchable
    }
    nextToken
  }
}
`;

export const customSearchCarouselClasss = `query SearchClasss(
  $filter: SearchableClassFilterInput
  $sort: SearchableClassSortInput
  $limit: Int
  $nextToken: String
) {
  searchClasss(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      __typename
      id
      title
      dateStart
      dateEnd
      isLongTerm
      timeStart
      timeEnd
      dayOfWeek
      numOfClass
      classFee
      createdAtEpoch
      tagSearchable
      regionSearchable
      classStatus
      host {
        id
      }
    }
    nextToken
  }
}
`;

export const customGetClass = `query GetClass($id: ID!) {
  getClass(id: $id) {
    __typename
    id
    title
    center {
      __typename
      id
      type
      name
      address
      tel
      lng
      lat
      homepage
      category
      createdAt
    }
    dateStart
    isLongTerm
    dateEnd
    dayOfWeek
    timeStart
    timeStartString
    timeEnd
    timeEndString
    numOfClass
    classFee
    host {
      __typename
      id
      name
      identityId
      blockedUser
      blockedBy
      oauthPicture
      picture {
        bucket
        region
        key
      }
      accountStatus
      ratings {
        completedClassCounter
        proxiedClassCounter
        cancelledClassCounter
        hostedClassCounter
        receivedHostReviewCounter
        receivedProxyReviewCounter
        satisfiedHostReviewCounter
        satisfiedProxyReviewCounter
      }
    }
    expiresAt
    expireType
    tagSearchable
    regionSearchable
    memo
    classStatus
    createdAt
    classCenterId
    classProxyId
    classHostReviewId
    classProxyReviewId
    blockedBy
    convs {
      items {
        id
        convStatus
      }
      nextToken
    }
    updateCounter
    extraInfo {
      classOrigin
      centerName
      centerAddress
      centerX
      centerY
      centerHomepage
      hostEmail
      hostPhone
    }
  }
}
`;

export const updateUserSearchData = `mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    __typename
    id
    name
    bookmark
    simpleSearchHistory
    detailSearchHistory
  }
}
`;

export const getUserInitProfile = `query GetUserInitProfile($id: ID!) {
  getUser(id: $id) {
    id
    name
    profileUpdated
    bookmark
    postBookmark
    subscribedTags
    lastReadClassAt
    lastSubscribedTagsUpdated
    identityId
  }
}
`;

export const customGetUserProfile = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    name
    intro
    identityId
    picture {
      bucket
      region
      key
    }
    accountStatus
    blockedUser
    blockedBy
    oauthPicture
    ratings {
      completedClassCounter
      proxiedClassCounter
      cancelledClassCounter
      hostedClassCounter
      receivedHostReviewCounter
      receivedProxyReviewCounter
      satisfiedHostReviewCounter
      satisfiedProxyReviewCounter
    }
    mannerCounter {
      gm01
      gm02
      gm03
      gm04
      gm05
      gm06
      gm07
      gm08
      gm09
      gm10
      gm11
      gm12
      gm13
      gm14
      gm15
      gm16
      bm01
      bm02
      bm03
      bm04
      bm05
      bm06
      bm07
      bm08
      bm09
      bm10
      bm11
      bm12
      bm13
      bm14
      bm15
      bm16
    }
    resumeURL
    instagramId
    facebookId
    settings {
      privacyResume
      privacyManners
    }
    mannerReviewed
  }
}
`;

export const updateUserProfile = `mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    name
    intro
    picture {
      bucket
      region
      key
    }
    resumeURL
    instagramId
    facebookId
    cellPhoneNumber
  
  }
}
`;

export const updateClassStatus = `mutation UpdateClassStatus($input: UpdateClassInput!) {
  updateClass(input: $input) {
    __typename
    id
    classStatus
  }
}
`;
export const customAddClassBlock = `mutation AddClassBlock($input: UpdateBlockInput) {
  addClassBlock(input: $input) {
    __typename
    id
    blockedBy
  }
}
`;
export const customDeleteClassBlock = `mutation DeleteClassBlock($input: UpdateBlockInput) {
  deleteClassBlock(input: $input) {
    __typename
    id
    blockedBy
  }
}
`;
export const customAddUserBlock = `mutation AddUserBlock($input: UpdateBlockInput) {
  addUserBlock(input: $input) {
    __typename
    id
    blockedBy
  }
}
`;
export const customDeleteUserBlock = `mutation DeleteUserBlock($input: UpdateBlockInput) {
  deleteUserBlock(input: $input) {
    __typename
    id
    blockedBy
  }
}
`;
export const customUpdateUserTags = `mutation UpdateUserTags($input: UpdateUserTagsInput) {
  updateUserTags(input: $input) {
    __typename
    id
    subscribedTags
  }
}
`;

export const customGetUserSubscribedTags = `query GetUserSubscribedTags($id: ID!) {
  getUser(id: $id) {
    __typename
    id
    subscribedTags
  }
}
`;

export const customUpdateClass = `mutation UpdateClass($input: UpdateClassInput!) {
  updateClass(input: $input) {
    __typename
    id
    title
    center {
      __typename
      id
    }
    dateStart
    dateEnd
    dayOfWeek
    timeStart
    timeStartString
    timeEnd
    timeEndString
    numOfClass
    classFee
    tagSearchable
    regionSearchable
    memo
    classStatus
    updateCounter
    createdAt
    classCenterId
    classProxyId
  }
}
`;

export const customListNotisByReceiverKindCreatedAt = `query ListNotisByReceiverKindCreatedAt(
  $notiReceiverId: ID
  $notiKindCreatedAt: ModelNotiGsi_ReceiverKindCreatedAtCompositeKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelNotiFilterInput
  $limit: Int
  $nextToken: String
) {
  listNotisByReceiverKindCreatedAt(
    notiReceiverId: $notiReceiverId
    notiKindCreatedAt: $notiKindCreatedAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken){
    __typename
    items {
      __typename
      id
      notiType
      content
      extraInfo
      createdAt
      notiConvId
    }
    nextToken
  }
}
`;

export const customDeleteNoti = `mutation DeleteNoti($input: DeleteNotiInput!)
{
  deleteNoti(input: $input) 
  {
    __typename
    id
    createdAt
  }
}`;

export const customSearchConvs = `query SearchConvs(
  $filter: SearchableConvFilterInput
  $sort: SearchableConvSortInput
  $limit: Int
  $nextToken: String
) {
  searchConvs(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
  ) {
    __typename
    items {
      __typename
      id
      user1exited
      user2exited
      onClass {
        __typename
        id
        title
        classStatus
      }
      user1 {
        __typename
        id
        name
        identityId
        picture {
          bucket
          region
          key
        }
        accountStatus
        blockedBy
        blockedUser
        oauthPicture        
      }
      user2 {
        __typename
        id
        name
        identityId
        picture {
          bucket
          region
          key
        }
        accountStatus
        blockedBy
        blockedUser
        oauthPicture    
      }
      messages {
        __typename
        items {
          __typename
          id
          content
          createdAt
          notiSenderId
        }
      }
      user1state
      user2state
      convStatus
    }
    nextToken
  }
}
`;

export const customListMessages = `query ListMessages(
  $notiConvId: ID
  $createdAt: ModelStringKeyConditionInput
  $filter: ModelNotiFilterInput
  $limit: Int
  $nextToken: String
) {
  listMessages(
    notiConvId: $notiConvId
    createdAt: $createdAt
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    __typename
    items {
      __typename
      id
      sender {
        __typename
        id
        name
        identityId
        picture {
          bucket
          region
          key
        }
        accountStatus
        oauthPicture
      }
      content
      extraInfo
      createdAt
      notiType
      notiConvId
    }
    nextToken
  }
}
`;

export const customGetConv = `query GetConv($id: ID!) {
  getConv(id: $id) {
    __typename
    id
    convStatus
    onClass {
      id
      title
      classStatus
    }

    user1 {
      id
      name
      blockedBy
      blockedUser
      accountStatus
    }
    user1exited
    user2 {
      id
      name
      blockedBy
      blockedUser
      accountStatus
    }
    user2exited
    user1state
    user2state
  }
}
`;

export const customCreateMessage = `mutation CreateMessage(
  $id: ID!
  $notiReceiverId: ID!
  $notiSenderId: ID
  $senderName: String
  $content: String
  $extraInfo: String
  $createdAt: AWSDateTime!
  $expiresAt: AWSTimestamp!
  $notiConvId: ID!
 
) {
  createMessage(
    id: $id
    notiReceiverId: $notiReceiverId
    notiSenderId: $notiSenderId
    senderName: $senderName
    content: $content
    extraInfo: $extraInfo
    createdAt: $createdAt
    expiresAt: $expiresAt
    notiConvId: $notiConvId

  )  {
    __typename
    id
    sender {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      oauthPicture
      identityId
      accountStatus
    }
    content
    extraInfo
    createdAt
    notiType
    notiConvId
    notiSenderId
    notiReceiverId
  }
}
`;

export const customCreateChatroom = `mutation CreateChatroom(
  $id: ID
  $convOnClassId: ID!
  $convStatus: ConvStatusType!
  $user1state: String
  $convUser1Id: ID!
  $user2state: String
  $convUser2Id: ID!
  $createdAt: AWSDateTime!
) {
  createChatroom(
    id: $id
    convOnClassId: $convOnClassId
    convStatus: $convStatus
    user1state: $user1state
    convUser1Id: $convUser1Id
    user2state: $user2state
    convUser2Id: $convUser2Id
    createdAt: $createdAt
  ) {
    __typename
    id
    onClass {
      __typename
      id
      title
      classStatus
    }
    user1 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      blockedBy
      blockedUser
      identityId
    }
    user2 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      blockedBy
      blockedUser
      identityId
    }
    messages {
      __typename
      items {
        __typename
        id
        content
        createdAt
        notiSenderId
      }
    }
    convUser1Id
    convUser2Id
    user1state
    user2state
    convStatus
    convOnClassId

    user1exited
    user2exited
  }
}
`;

export const customOnCreateMessage = `subscription OnCreateMessage($notiConvId: ID!) {
  onCreateMessage(notiConvId: $notiConvId) {
    __typename
    id
    sender {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      oauthPicture
      identityId
      accountStatus
    }
    content
    extraInfo
    createdAt
    notiType
    notiConvId
    notiSenderId
    notiReceiverId
  }

}
`;

export const customOnCreateChatroom1 = `subscription OnCreateChatroom1($convUser1Id: ID!) {
  onCreateChatroom1(convUser1Id: $convUser1Id) {
    __typename
    id
    onClass {
      __typename
      id
      title
      classStatus
    }
    user1 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      blockedBy
      blockedUser
      identityId
    }
    user2 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      blockedBy
      blockedUser
      identityId
    }
    messages {
      __typename
      items {
        __typename
        id
        content
        createdAt
        notiSenderId
      }
    }
    convUser1Id
    convUser2Id
    user1state
    user2state
    convStatus
    convOnClassId

    user1exited
    user2exited
  }
}
`;
export const customOnCreateChatroom2 = `subscription OnCreateChatroom2($convUser2Id: ID!) {
  onCreateChatroom2(convUser2Id: $convUser2Id) {
    __typename
    id
    onClass {
      __typename
      id
      title
      classStatus
    }
    user1 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      blockedBy
      blockedUser
      identityId
    }
    user2 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      blockedBy
      blockedUser
      identityId
    }
    messages {
      __typename
      items {
        __typename
        id
        content
        createdAt
        notiSenderId
      }
    }
    convUser1Id
    convUser2Id
    user1state
    user2state
    convStatus
    convOnClassId

    user1exited
    user2exited
  }
}
`;
export const customOnCreateChatroom3 = `subscription OnCreateChatroom3($convOnClassId: ID!) {
  onCreateChatroom3(convOnClassId: $convOnClassId) {
    __typename
    id
    onClass {
      __typename
      id
      title
      classStatus
    }
    user1 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      identityId
    }
    user2 {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      identityId
    }
    messages {
      __typename
      items {
        __typename
        id
        content
        createdAt
        notiSenderId
      }
    }
    convUser1Id
    convUser2Id
    user1state
    user2state
    convStatus
    convOnClassId

    user1exited
    user2exited
  }
}
`;
export const customDeleteChatroom = `mutation DeleteChatroom(
  $id: ID!
  $notiId: ID!
  $notiReceiverId: ID!
  $notiSenderId: ID
  $senderName: String
  $content: String
  $extraInfo: String
  $createdAt: AWSDateTime!
  $expiresAt: AWSTimestamp!
  $notiConvId: ID!

  $user1exited: ID
  $user2exited: ID
) {
  deleteChatroom(
    id: $id
    notiId: $notiId
    notiReceiverId: $notiReceiverId
    notiSenderId: $notiSenderId
    senderName: $senderName
    content: $content
    extraInfo: $extraInfo
    createdAt: $createdAt
    expiresAt: $expiresAt
    notiConvId: $notiConvId

    user1exited: $user1exited
    user2exited: $user2exited
  ) {
    __typename
    id
    convStatus

    user1exited
    user2exited
    messages {
      __typename
      items {
        __typename
        id
        content
        createdAt
        notiConvId
        notiType
        extraInfo
        notiSenderId
        sender {
          __typename
          id
          name
          identityId
          picture {
            bucket
            region
            key
          }
          accountStatus
          oauthPicture
        }
      }
    }
  }
}
`;

export const customUpdateConv = `mutation UpdateConv($input: UpdateConvInput!) {
  updateConv(input: $input) {
    id
    convStatus
    user1state
    user1exited
    convUser1Id
    user2state
    user2exited
    convUser2Id
  }
}
`;

export const customOnDeleteChatroom = `subscription OnDeleteChatroom($id: ID!) {
  onDeleteChatroom(id: $id) {
    __typename
    id
    convStatus

    user1exited
    user2exited
    messages {
      __typename
      items {
        __typename
        id
        content
        createdAt
        notiConvId
        notiType
        extraInfo
        notiSenderId
        sender {
          __typename
          id
          name
          identityId
          picture {
            bucket
            region
            key
          }
          accountStatus
          oauthPicture
        }
      }
    }
  }
}`;

export const customListBookmarkedClass = `query ListBookmarkedClass($ids: [ID]) {
  listBookmarkedClass(ids: $ids) {
    id
    title
    dateStart
    timeStart
    classFee
    host {
      id
    }
    tagSearchable
    regionSearchable
    classStatus
    createdAt
    expiresAt
    convs {
      items {
        id
      }
      nextToken
    }
  }
}
`;

export const customListClasss = `query SearchClasss(
  $filter: SearchableClassFilterInput
  $sort: SearchableClassSortInput
  $limit: Int
  $nextToken: String
) {
  searchClasss(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      title
      dateStart
      timeStart
      host {
        id
        name
      }
      center {
        id
        name
        address
      }
      memo
      tagSearchable
      regionSearchable
      classStatus
      updateCounter
      classFee
      createdAt
      classHostReviewId
      classProxyReviewId
      isLongTerm
    }
    nextToken
  }
}
`;

export const customUpdateConvUserState = `mutation UpdateConvUserState(
  $id: ID!
  $user1state: String
  $user2state: String
) {
  updateConvUserState(
    id: $id
    user1state: $user1state
    user2state: $user2state
  ) {
    id
    user1state
    user2state
  }
}
`;

export const customOnUpdateConvUserState = `subscription OnUpdateConvUserState($id: ID!) {
  onUpdateConvUserState(id: $id) {
    id
    user1state
    user2state
  }
}
`;

export const customSearchProxy = `query SearchConvs(
  $filter: SearchableConvFilterInput
  $sort: SearchableConvSortInput
  $limit: Int
  $nextToken: String
) {
  searchConvs(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
  ) {
    __typename
    items {
      __typename
      id
      user2 {
        __typename
        id
        name
        identityId
        picture {
          bucket
          region
          key
        }
        accountStatus
        blockedUser
        blockedBy
        oauthPicture    
      }
      user1 {
        __typename
        id
        name
        identityId
        picture {
          bucket
          region
          key
        }
        accountStatus
        blockedUser
        blockedBy
        oauthPicture    
      }
      convOnClassId
    }
    nextToken
  }
}
`;

export const customPipelineCreateClassProxyReview = `mutation PipelineCreateClassReview($input: CreateClassReviewInput) {
  pipelineCreateClassReview(input: $input) {
    id
    type
    reviewedClass {
      __typename
      id
      classStatus
      classProxyReviewId
    }
    reviewsRevieweeId
  }
}
`;
export const customPipelineCreateClassHostReview = `mutation PipelineCreateClassReview($input: CreateClassReviewInput) {
  pipelineCreateClassReview(input: $input) {
    id
    type
    reviewedClass {
      __typename
      id
      classStatus
      classHostReviewId
    }
    reviewsRevieweeId
  }
}
`;

export const customGetReviews = `query GetReviews($id: ID!) {
  getReviews(id: $id) {
    id
    type
    satisfaction
    reviewedClass {
      id
      title
      host {
        id
      }
    }
    reviewer {
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      identityId
    }
    reviewee {
      id
      name
      picture {
        bucket
        region
        key
      }
      accountStatus
      oauthPicture
      identityId
    }
    createdAt
    manners
    content
  }
}
`;

export const customListReviewsByReviewee = `query ListReviewsByReviewee(
  $reviewsRevieweeId: ID
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelReviewsFilterInput
  $limit: Int
  $nextToken: String
) {
  listReviewsByReviewee(
    reviewsRevieweeId: $reviewsRevieweeId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      type
      satisfaction
      reviewer {
        id
        name
        picture {
          bucket
          region
          key
        }
        accountStatus
        oauthPicture
        identityId
      }
      createdAt
      content
    }
    nextToken
  }
}
`;

export const getMyBlockedList = `query GetMyBlockedList($id: ID!) {
  getUser(id: $id) {
    id
    blockedUser
    blockedClass
    blockedPost
  }
}`;

export const getMyBlockedClass = `query GetMyBlockedClass($id: ID!) {
  getClass(id: $id) {
    __typename
    id
    title
    blockedBy
    host {
      id
    }
  }
}`;

export const getMyBlockedUser = `query GetMyBlockedUser($id: ID!) {
  getUser(id: $id) {
    id
    name
    blockedBy
    picture {
      bucket
      region
      key
    }
    accountStatus
    oauthPicture
    identityId
  }
}`;

export const updateUserSettings = `mutation UpdateUserSettings($id: ID!, $privacyManners: Boolean!, $privacyResume: Boolean!) {
  updateUserSettings(id: $id, privacyManners: $privacyManners, privacyResume: $privacyResume) {
    __typename
    id
    settings {
      privacyManners
      privacyResume
    }
  }
}
`;

export const customCreateUserReview = `mutation CreateUserReview($input: CreateUserReviewInput) {
  createUserReview(input: $input) {
    id
    type

    reviewsReviewerId
    reviewsRevieweeId
  }
}
`;

export const updateUserVisitTime = `mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    lastReadClassAt
  }
}
`;

export const getTags = `query GetNews($id: ID!, $createdAt: AWSDateTime!) {
  getNews(id: $id, createdAt:$createdAt) {
    id
    extraData
  }
}
`;

export const customUpdateBookmark = `mutation UpdateBookmark($userId: ID!, $toAdd: String, $toDelete: String, $reset: Boolean) {
  updateBookmark(userId: $userId, toAdd: $toAdd, toDelete: $toDelete, reset: $reset) {
    id
    bookmark
  }
}
`;

export const customUpdateSearchHistory = `mutation UpdateSearchHistory(
  $userId: ID!
  $type: String!
  $toAdd: [String]
  $toDelete: [String]
  $reset: Boolean
) {
  updateSearchHistory(
    userId: $userId
    type: $type
    toAdd: $toAdd
    toDelete: $toDelete
    reset: $reset
  ) {
    id
    simpleSearchHistory
    detailSearchHistory
  }
}
`;

export const customOnReceiveMessage = `subscription OnReceiveMessage($notiReceiverId: ID!) {
  onReceiveMessage(notiReceiverId: $notiReceiverId) {
    __typename
    id
    sender {
      __typename
      id
      name
      picture {
        bucket
        region
        key
      }
      oauthPicture
      identityId
      accountStatus
    }
    content
    extraInfo
    createdAt
    notiType
    notiConvId
    notiSenderId
    notiReceiverId
  }
}
`;

export const customCreatePost = `mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    postTitle
    postStatus
    postType
    postCategory
    createdAt
    postPicture {
      bucket
      region
      key
    }
    numOfViews
    numOfLikes
    numOfComments
    thumbnailURL
    blockedBy
    author {
      id
      name
      identityId
      blockedBy
      blockedUser
    }
  }
}
`;

export const customOnCreatePostType = /* GraphQL */ `
  subscription OnCreatePostType($postType: PostType!) {
    onCreatePostType(postType: $postType) {
      id
      postTitle
      postStatus
      postType
      postCategory
      createdAt
      postPicture {
        bucket
        region
        key
      }
      numOfViews
      numOfLikes
      numOfComments
      thumbnailURL
      author {
        id
        name
        identityId
        blockedBy
        blockedUser
      }
    }
  }
`;

export const customOnCreatePostCategory = /* GraphQL */ `
  subscription OnCreatePostCategory($postCategory: PostCategory!) {
    onCreatePostCategory(postCategory: $postCategory) {
      id
      postTitle
      postStatus
      postType
      postCategory
      createdAt
      postPicture {
        bucket
        region
        key
      }
      postTags
      numOfViews
      numOfLikes
      numOfComments
      thumbnailURL
      author {
        id
        name
        identityId
        blockedBy
        blockedUser
      }
    }
  }
`;

export const customListPostsByType = /* GraphQL */ `
  query ListPostsByType(
    $postType: PostType
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPostsByType(
      postType: $postType
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        postTitle
        postStatus
        postType
        postCategory
        createdAt
        # postLink
        postPicture {
          bucket
          region
          key
        }
        # postContent
        numOfViews
        numOfLikes
        # numOfDislikes
        numOfComments
        thumbnailURL
        blockedBy

        author {
          id
          name
          # intro
          # picture {
          #   bucket
          #   region
          #   key
          # }
          # oauthPicture
          identityId
          # email
          # resumeURL
          # instagramId
          # facebookId
          # receivedReviews {
          #   nextToken
          # }
          # subscribedTags
          # lastSubscribedTagsUpdated
          # profileUpdated
          # bookmark
          # simpleSearchHistory
          # detailSearchHistory
          # addressTag
          blockedBy
          blockedUser
          # blockedClass
          # mannerReviewed
          # numOfReported
          # mannerCounter {
          #   gm01
          #   gm02
          #   gm03
          #   gm04
          #   gm05
          #   gm06
          #   gm07
          #   gm08
          #   gm09
          #   gm10
          #   gm11
          #   gm12
          #   gm13
          #   gm14
          #   gm15
          #   gm16
          #   bm01
          #   bm02
          #   bm03
          #   bm04
          #   bm05
          #   bm06
          #   bm07
          #   bm08
          #   bm09
          #   bm10
          #   bm11
          #   bm12
          #   bm13
          #   bm14
          #   bm15
          #   bm16
          # }
          # ratings {
          #   completedClassCounter
          #   hostedClassCounter
          #   proxiedClassCounter
          #   cancelledClassCounter
          #   receivedHostReviewCounter
          #   satisfiedHostReviewCounter
          #   receivedProxyReviewCounter
          #   satisfiedProxyReviewCounter
          # }
          # settings {
          #   privacyResume
          #   privacyManners
          # }
          # accountStatus
          # lastReadClassAt
          # lastLoginAt
          # cellPhoneNumber
          # myPosts {
          #   nextToken
          # }
        }
      }
      nextToken
    }
  }
`;

export const customListPostsByCategory = /* GraphQL */ `
  query ListPostsByCategory(
    $postCategory: PostCategory
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPostsByCategory(
      postCategory: $postCategory
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        postTitle
        postStatus
        postType
        postCategory
        createdAt
        blockedBy
        # postLink
        postPicture {
          bucket
          region
          key
        }
        postTags
        # postContent
        numOfViews
        numOfLikes
        # numOfDislikes
        numOfComments
        thumbnailURL
        author {
          id
          name
          # intro
          # picture {
          #   bucket
          #   region
          #   key
          # }
          # oauthPicture
          identityId
          # email
          # resumeURL
          # instagramId
          # facebookId
          # receivedReviews {
          #   nextToken
          # }
          # subscribedTags
          # lastSubscribedTagsUpdated
          # profileUpdated
          # bookmark
          # simpleSearchHistory
          # detailSearchHistory
          # addressTag
          blockedBy
          blockedUser
          # blockedClass
          # mannerReviewed
          # numOfReported
          # mannerCounter {
          #   gm01
          #   gm02
          #   gm03
          #   gm04
          #   gm05
          #   gm06
          #   gm07
          #   gm08
          #   gm09
          #   gm10
          #   gm11
          #   gm12
          #   gm13
          #   gm14
          #   gm15
          #   gm16
          #   bm01
          #   bm02
          #   bm03
          #   bm04
          #   bm05
          #   bm06
          #   bm07
          #   bm08
          #   bm09
          #   bm10
          #   bm11
          #   bm12
          #   bm13
          #   bm14
          #   bm15
          #   bm16
          # }
          # ratings {
          #   completedClassCounter
          #   hostedClassCounter
          #   proxiedClassCounter
          #   cancelledClassCounter
          #   receivedHostReviewCounter
          #   satisfiedHostReviewCounter
          #   receivedProxyReviewCounter
          #   satisfiedProxyReviewCounter
          # }
          # settings {
          #   privacyResume
          #   privacyManners
          # }
          # accountStatus
          # lastReadClassAt
          # lastLoginAt
          # cellPhoneNumber
          # myPosts {
          #   nextToken
          # }
        }
      }
      nextToken
    }
  }
`;

export const customGetPost = /* GraphQL */ `
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      postTitle
      postType
      postCategory
      createdAt
      updatedAt
      postLink
      postStatus
      postTags
      postPicture {
        bucket
        region
        key
      }
      postContent
      numOfViews
      numOfLikes
      numOfComments
      thumbnailURL
      blockedBy
      numOfReported
      author {
        id
        name
        intro
        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId
        blockedBy
        blockedUser
        ratings {
          completedClassCounter
          hostedClassCounter
          proxiedClassCounter
          cancelledClassCounter
          receivedHostReviewCounter
          satisfiedHostReviewCounter
          receivedProxyReviewCounter
          satisfiedProxyReviewCounter
        }
        accountStatus
      }
    }
  }
`;

export const customUpdatePost = /* GraphQL */ `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      id
      postTitle
      postType
      postCategory
      createdAt
      updatedAt
      postLink
      postStatus
      postPicture {
        bucket
        region
        key
      }
      postContent
      numOfViews
      numOfLikes
      numOfComments
      thumbnailURL
      blockedBy
      numOfReported
      author {
        id
        name
        intro
        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId
        blockedBy
        blockedUser
        ratings {
          completedClassCounter
          hostedClassCounter
          proxiedClassCounter
          cancelledClassCounter
          receivedHostReviewCounter
          satisfiedHostReviewCounter
          receivedProxyReviewCounter
          satisfiedProxyReviewCounter
        }
        accountStatus
      }
    }
  }
`;

export const customUpdatePostNumbers = /* GraphQL */ `
  mutation UpdatePostNumbers($id: ID!, $toAdd: String, $toDelete: String) {
    updatePostNumbers(id: $id, toAdd: $toAdd, toDelete: $toDelete) {
      id
      numOfViews
      numOfLikes
      numOfComments
    }
  }
`;

export const customUpdatePostBookmark = /* GraphQL */ `
  mutation UpdatePostBookmark(
    $userId: ID!
    $toAdd: String
    $toDelete: String
    # $postCreatedAt: String
    $reset: Boolean
  ) {
    updatePostBookmark(
      userId: $userId
      toAdd: $toAdd
      toDelete: $toDelete
      # postCreatedAt: $postCreatedAt
      reset: $reset
    ) {
      id
      postBookmark
    }
  }
`;
export const updatePostStatus = `mutation UpdatePostStatus($input: UpdatePostInput!) {
  updatePost(input: $input) {
    __typename
    id
    postStatus
  }
}
`;
export const customAddPostBlock = `mutation AddPostBlock($input: UpdateBlockInput) {
  addPostBlock(input: $input) {
    __typename
    id
    blockedBy
  }
}
`;
export const customDeletePostBlock = `mutation DeletePostBlock($input: UpdateBlockInput) {
  deletePostBlock(input: $input) {
    __typename
    id
    blockedBy
  }
}
`;

export const customListCommentsByAddedTo = /* GraphQL */ `
  query ListCommentsByAddedTo(
    $addedToId: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCommentsByAddedTo(
      addedToId: $addedToId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        addedToId
        originalId
        createdAt
        commentContent
        commentStatus
        commentNotiStatus
        commentDepth
        numOfSub
        ...CommentNumbersFragment
        latestSubComment {
          id
          author {
            id
            name

            picture {
              bucket
              region
              key
            }
            oauthPicture
            identityId
            blockedBy
            blockedUser
          }
        }
        receiver {
          id
          name
        }
        author {
          id
          name

          picture {
            bucket
            region
            key
          }
          oauthPicture
          identityId
          blockedBy
          blockedUser
        }
      }
      nextToken
    }
  }
  fragment CommentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;

export const customCreateComment = /* GraphQL */ `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      addedToId
      originalId
      createdAt
      commentContent
      commentStatus
      commentNotiStatus
      commentDepth
      numOfSub
      ...CommentNumbersFragment
      receiver {
        id
        name
      }
      author {
        id
        name

        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId

        blockedBy
        blockedUser
      }
      latestSubComment {
        id
        author {
          id
          name

          picture {
            bucket
            region
            key
          }
          oauthPicture
          identityId
          blockedBy
          blockedUser
        }
      }
    }
  }
  fragment CommentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;

export const customOnCreatePostComment = /* GraphQL */ `
  subscription OnCreatePostComment($addedToId: ID!) {
    onCreatePostComment(addedToId: $addedToId) {
      id
      addedToId
      originalId
      createdAt
      commentContent
      commentStatus
      commentNotiStatus
      commentDepth
      numOfSub
      ...CommentNumbersFragment
      receiver {
        id
        name
      }
      author {
        id
        name

        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId

        blockedBy
        blockedUser
      }
    }
  }
  fragment CommentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;
export const customUpdateCommentNumbers = /* GraphQL */ `
  mutation UpdateCommentNumbers($commentId: ID!, $userId: ID!, $addLike: Boolean, $delLike: Boolean, $addBlock: Boolean, $addSub: ID, $delSub: ID) {
    updateCommentNumbers(
      commentId: $commentId
      userId: $userId
      addLike: $addLike
      delLike: $delLike
      addBlock: $addBlock
      addSub: $addSub
      delSub: $delSub
    ) {
      id
      ...CommentNumbersFragment
    }
  }
  fragment CommentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;

export const commentNumbersFragment = /* GraphQL */ `
  fragment commentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;

export const updateCommentStatus = /* GraphQL */ `
  mutation UpdateCommentStatus($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      __typename
      id
      commentStatus
    }
  }
`;

export const customUpdateComment = /* GraphQL */ `
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id
      addedToId
      originalId
      createdAt
      commentContent
      commentStatus
      commentNotiStatus
      commentDepth
      numOfSub
      ...CommentNumbersFragment
      receiver {
        id
        name
      }
      author {
        id
        name

        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId

        blockedBy
        blockedUser
      }
      latestSubComment {
        id
        author {
          id
          name

          picture {
            bucket
            region
            key
          }
          oauthPicture
          identityId
          blockedBy
          blockedUser
        }
      }
    }
  }
  fragment CommentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;

export const onCustomUpdatePost = /* GraphQL */ `
  subscription onCustomUpdatePost($id: ID!) {
    onCustomUpdatePost(id: $id) {
      id
      postTitle
      postType
      postCategory
      createdAt
      updatedAt
      postLink
      postStatus
      postPicture {
        bucket
        region
        key
      }
      postContent
      numOfViews
      numOfLikes
      numOfComments
      thumbnailURL
      blockedBy
      numOfReported
      author {
        id
        name

        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId
        blockedBy
        blockedUser
        ratings {
          completedClassCounter
          hostedClassCounter
          proxiedClassCounter
          cancelledClassCounter
          receivedHostReviewCounter
          satisfiedHostReviewCounter
          receivedProxyReviewCounter
          satisfiedProxyReviewCounter
        }
        accountStatus
      }
    }
  }
`;

export const onCustomUpdateClass = /* GraphQL */ `
  subscription onCustomUpdateClass($id: ID!) {
    onCustomUpdateClass(id: $id) {
      id
      title
      center {
        __typename
        id
        type
        name
        address
        tel
        lng
        lat
        homepage
        category
        createdAt
      }
      dateStart
      isLongTerm
      dateEnd
      dayOfWeek
      timeStart
      timeStartString
      timeEnd
      timeEndString
      numOfClass
      classFee
      host {
        __typename
        id
        name
        identityId
        blockedUser
        blockedBy
        oauthPicture
        picture {
          bucket
          region
          key
        }
        accountStatus
        ratings {
          completedClassCounter
          proxiedClassCounter
          cancelledClassCounter
          hostedClassCounter
          receivedHostReviewCounter
          receivedProxyReviewCounter
          satisfiedHostReviewCounter
          satisfiedProxyReviewCounter
        }
      }
      tagSearchable
      regionSearchable
      memo
      classStatus
      createdAt
      classCenterId
      classProxyId
      classHostReviewId
      classProxyReviewId
      blockedBy
      convs {
        items {
          id
          convStatus
        }
        nextToken
      }
      updateCounter
      extraInfo {
        classOrigin
        centerName
        centerAddress
        centerX
        centerY

        centerHomepage
      }
    }
  }
`;

export const customGetComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      addedToId
      originalId
      createdAt
      commentContent
      commentStatus
      commentNotiStatus
      commentDepth
      numOfSub
      ...CommentNumbersFragment
      latestSubComment {
        id
        author {
          id
          name

          picture {
            bucket
            region
            key
          }
          oauthPicture
          identityId
          blockedBy
          blockedUser
        }
      }
      receiver {
        id
        name
      }
      author {
        id
        name

        picture {
          bucket
          region
          key
        }
        oauthPicture
        identityId
        blockedBy
        blockedUser
      }
    }
  }
  fragment CommentNumbersFragment on Comment {
    numOfReported
    numOfLikes
    likedUsers
    blockedBy
    numOfSub
  }
`;

export const customListCommentsByReceiver = /* GraphQL */ `
  query ListCommentsByReceiver(
    $commentReceiverId: String
    $commentNotiStatusCreatedAt: ModelCommentGsi_CommentReceiverByCommentNotiStatusCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCommentsByReceiver(
      commentReceiverId: $commentReceiverId
      commentNotiStatusCreatedAt: $commentNotiStatusCreatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        addedToId
        originalId
        createdAt
        # commentType
        commentDepth
        commentStatus
        commentNotiStatus
        commentContent
        blockedBy
        commentNotiStatus
        replyInfo {
          repliedToId
          repliedPostTitle
        }
        receiver {
          id
          name
        }
        author {
          id
          name
          intro
          picture {
            bucket
            region
            key
          }
          oauthPicture
          identityId
          addressTag
          blockedBy
          blockedUser
          accountStatus
        }
      }
      nextToken
    }
  }
`;

export const deleteCommentNoti = /* GraphQL */ `
  mutation DeleteCommentNoti($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id
      commentNotiStatus
    }
  }
`;

export const customListPostsByAuthor = /* GraphQL */ `
  query ListPostsByAuthor(
    $postAuthorId: String
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPostsByAuthor(
      postAuthorId: $postAuthorId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        postTitle
        postStatus
        postType
        postCategory
        createdAt
        numOfLikes
        numOfComments
        postPicture {
          bucket
          region
          key
        }
        thumbnailURL
      }
    }
  }
`;

export const customListBookmarkedPost = /* GraphQL */ `
  query ListBookmarkedPost($ids: [ID]) {
    listBookmarkedPost(ids: $ids) {
      id
      postTitle
      postStatus
      postType
      postCategory
      createdAt
      numOfLikes
      numOfComments
      postPicture {
        bucket
        region
        key
      }
      thumbnailURL
    }
  }
`;

export const getMyBlockedPost = `query GetMyBlockedPost($id: ID!) {
  getPost(id: $id) {
    __typename
    id
    postTitle
    blockedBy

  }
}`;

export const customListNewsByType = /* GraphQL */ `
  query ListNewsByType(
    $newsType: NewsType
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelNewsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNewsByType(newsType: $newsType, createdAt: $createdAt, sortDirection: $sortDirection, filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        newsType
        createdAt
        updatedAt
        newsStatus
        newsTitle
        newsURL
        newsScreen
        newsBanner {
          bucket
          region
          key
        }
        validDate
        extraInfo
        extraData
      }
      nextToken
    }
  }
`;
