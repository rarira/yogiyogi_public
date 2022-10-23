import React, { memo, useEffect, useState } from 'react';
import { Tag, Tags } from '../../types/store';
import { Text, View } from 'react-native';

import Loading from '../Loading';
import { TAGS_CREATED_AT } from '../../configs/variables';
import TabTagList from '../TabTagList';

import { getTags } from '../../customGraphqls';
import gql from 'graphql-tag';
import guestClient from '../../configs/guestClient';
import sort from 'js-flock/sort';

import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';

interface Props {
  termDispatch: (arg: {}) => void;
  handleClose: () => void;
  regionTerm: string;
}

const GET_TAGS = gql(getTags);

const RegionTerm = ({ termDispatch, handleClose, regionTerm }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();

  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const [selectedTags, setSelectedTags] = useState<string[]>([regionTerm]);
  const [regionTags, setRegionTags] = useState<Array<Tag>>([]);

  const { loading: regionTagsLoading, data: regionTagsData, error: regionTagsError } = useQuery(GET_TAGS, {
    variables: {
      id: 'region-tags',
      createdAt: TAGS_CREATED_AT,
    },
    fetchPolicy: 'network-only',
    ...(!user && { client: guestClient }),
  });

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (regionTagsData?.getNews?.extraData) {
        const regionTagsRaw: Tags = JSON.parse(regionTagsData.getNews.extraData);
        const regionTagsTempArray = Object.values(regionTagsRaw);
        const tempArray = sort(regionTagsTempArray).asc((tag: Tag) => {
          return tag.index;
        });
        setRegionTags(tempArray);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [regionTagsData]);

  if (regionTagsLoading) return <Loading origin="RegionTerm" />;

  const handleSetTerm = () => {
    termDispatch({ type: 'setTerm', regionTerm: selectedTags?.[0] });
    handleClose();
  };

  return (
    <View style={compStyles.searchContainer}>
      <View style={[compStyles.buttons, compStyles.searchTermButtons]}>
        <ThemedButton
          mode="text"
          compact
          color={theme.colors.accent}
          onPress={handleClose}
          style={compStyles.buttonMarginRight}
        >
          취소
        </ThemedButton>
        <ThemedButton mode="text" compact onPress={handleSetTerm} disabled={!selectedTags?.[0]}>
          선택한 지역으로 설정
        </ThemedButton>
      </View>
      <View style={compStyles.textContainer}>
        <Text style={compStyles.text}>
          선택한 지역: {selectedTags && selectedTags.length !== 0 ? selectedTags[0].split('_')[1] : ''}
        </Text>
      </View>
      <TabTagList
        tabLabel="지역"
        data={regionTags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        isRegion
        isSearchTerm
        appearance={appearance}
      />
    </View>
  );
};

export default memo(RegionTerm);
