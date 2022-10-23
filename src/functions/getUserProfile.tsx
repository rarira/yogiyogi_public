import API from '@aws-amplify/api';

// import { getUser } from '../graphql/queries';
import { getUserInitProfile } from '../customGraphqls';
import reportSentry from '../functions/reportSentry';

const getUserProfile = async (userId: string) => {
  try {
    const queriedUser: any = await API.graphql({
      query: getUserInitProfile,
      variables: {
        id: userId,
      },
    });

    return queriedUser;
  } catch (e) {
    reportSentry(e);
    throw e;
  }
};

export default getUserProfile;
