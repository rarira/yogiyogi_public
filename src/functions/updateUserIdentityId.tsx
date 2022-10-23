import API from '@aws-amplify/api';

import reportSentry from '../functions/reportSentry';
// import { getUser } from '../graphql/queries';
import { updateUserProfile } from '../customGraphqls';

const updateUserIdentityId = async (userId: string, identityId: string) => {
  try {
    const queriedUser: any = await API.graphql({
      query: updateUserProfile,
      variables: {
        input: {
          id: userId,
          identityId,
        },
      },
    });
    return queriedUser;
  } catch (e) {
    reportSentry(e);
    throw e;
  }
};

export default updateUserIdentityId;
