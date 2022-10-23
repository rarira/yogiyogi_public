import { FlatList, StyleSheet, View } from 'react-native';
import { customListPostsByCategory, customOnCreatePostCategory } from '../../customGraphqls';
import theme, { getThemeColor } from '../../configs/theme';

import AndroidDivider from '../AndroidDivider';
import ListHeader from './ListHeader';
import ListPostCard from './ListPostCard';
import { PostData } from '../../types/store';
import React, { useMemo } from 'react';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
import produce from 'immer';
import { useStoreState } from '../../stores/initStore';
// import { useStoreState } from '../../stores/initStore';
import { useSubscription } from '@apollo/react-hooks';
// import Loading from '../Loading';
import reportSentry from '../../functions/reportSentry';
import { PostCategory, PostStatus } from '../../API';
import getPostCategory from '../../functions/getPostCategory';

interface ListPostsProps {
  data: unknown;
  error: unknown;
  category: PostCategory;
  // snackbarDispatch: (arg: MySnackbarAction) => void;
}

const LIST_POSTS = gql(customListPostsByCategory);
const SUBSCRIBE_TO_POST_CREATE_CATEGORY = gql(customOnCreatePostCategory);

const ListPosts = ({ data, error, category }: ListPostsProps) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();

  const categoryText = useMemo(() => getPostCategory(category), [category]);

  const variables = {
    postType: category,
    limit: category === PostCategory.info ? 5 : 3,
    sortDirection: 'DESC',
    filter: { postStatus: { eq: PostStatus.open } },
  };

  useSubscription(SUBSCRIBE_TO_POST_CREATE_CATEGORY, {
    variables,
    ...(!user && { client: guestClient }),

    onSubscriptionData: options => {
      // console.log(`onCreatePostCategory subscribed _ ${queryCategory}`);
      try {
        const { onCreatePostCategory } = options.subscriptionData.data;
        const queryResult: any = options.client.readQuery({
          query: LIST_POSTS,
          variables,
        });

        const { items, ...others } = queryResult.listPostsByCategory;
        if (!items[0] || items[0].id !== onCreatePostCategory.id) {
          // console.log('subscription data fetches new message: ', onCreatePostCategory);

          const nextItems = produce(items, (draft: any) => {
            draft.unshift(onCreatePostCategory);
          });

          const newData = { listPostsByCategory: { items: nextItems, ...others } };
          options.client.writeQuery({ query: LIST_POSTS, variables, data: newData });
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  const _keyExtractor = (item: PostData) => item.id;

  const renderItem = ({ item }: { item: PostData }) => {
    return <ListPostCard item={item} />;
  };

  const renderItemSeparatorComponent = () => (
    <AndroidDivider needMarginHorizontal needMarginVertical color={getThemeColor('background', appearance)} />
  );

  if (!data || !data.listPostsByCategory) {
    return null;
  }
  if (error) {
    reportSentry(error);
    // snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  return (
    <View style={styles.container}>
      <ListHeader title={`최근 ${categoryText} 게시물`} category="post" postCategory={category} />
      <FlatList
        data={data.listPostsByCategory.items}
        keyExtractor={_keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={renderItemSeparatorComponent}
        keyboardDismissMode="on-drag"
        maxToRenderPerBatch={4}
      />
    </View>
  );
};

export default ListPosts;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // backgroundColor: getThemeColor('background', appearance),
    marginVertical: theme.size.small,
    marginHorizontal: theme.size.big,
  },
  listContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // backgroundColor: getThemeColor('background', appearance),
  },
});
