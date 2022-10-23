import Auth from '@aws-amplify/auth';
import kakaoPw from '../configs/kakaoPw';
import reportSentry from '../functions/reportSentry';

const emailAliasCheck = async (email: string) => {
  try {
    const data = await Auth.signIn(email, kakaoPw);
    return data;
  } catch (e) {
    if (e.code === 'NotAuthorizedException') {
      throw e;
    } else {
      reportSentry(e);
      return 'OK';
    }
  }
};

export default emailAliasCheck;
