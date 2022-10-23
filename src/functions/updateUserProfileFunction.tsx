import API from '@aws-amplify/api';
import { UpdateUserInput } from '../API';

const updateUserProfileFunction = async (mutation: any, userId: string, updateInput: Partial<UpdateUserInput>) => {
  const updateUserInput: UpdateUserInput = { id: userId, ...updateInput };
  const result = await API.graphql({
    query: mutation,
    variables: {
      input: updateUserInput,
    },
  });
  return result;
};

export default updateUserProfileFunction;
