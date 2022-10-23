import { AUTH_TYPE } from 'aws-appsync';
import { AuthOptions, createAuthLink } from 'aws-appsync-auth-link';

import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import awsmobile from '../aws-exports';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

// const auth: AuthOptions = { type: AUTH_TYPE.API_KEY, apiKey: awsmobile.aws_appsync_apiKey };

// const url = awsmobile.aws_appsync_graphqlEndpoint;
// const region = awsmobile.aws_appsync_region;

// const link = ApolloLink.from([
//   createAuthLink({ url, region, auth }),
//   // createSubscriptionHandshakeLink(url),
//   // createHttpLink({ uri: url }),
// ]);

const guestClient = {};

export default guestClient;
