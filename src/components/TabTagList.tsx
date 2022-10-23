import { CLASS_TAG_LIMIT, USER_TAG_LIMIT } from '../configs/variables';
import ChunkRender, { KeywordTagItem } from './ChunkRender';
import { Keyboard, StyleSheet } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';

import { List } from 'react-native-paper';
import Loading from './Loading';
import { MySnackbarAction } from './MySnackbar';
import { ScrollView } from 'react-native';
import { AppearanceType, Tag } from '../types/store';
import TagItem from './TagItem';
import { getTheme } from '../configs/theme';

interface Props {
  tabLabel?: string;
  data: Tag[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  snackbarDispatch?: (arg: MySnackbarAction) => void;
  isRegion?: boolean;
  isSubsScreen?: boolean;
  isSearchTerm?: boolean;
  appearance: AppearanceType;
}

interface KeywordTagItems extends KeywordTagItem {
  children: KeywordTagItem[];
}

const TabTagList = ({
  selectedTags,
  setSelectedTags,
  data,
  snackbarDispatch,
  isRegion,
  isSubsScreen,
  isSearchTerm,
  appearance,
}: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme, isSearchTerm);

  const [expandedChunk, setExpandedChunk] = useState<{ idx: number; height: number } | null>(null);
  const scrollEl = useRef(null);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && expandedChunk && scrollEl.current) {
      const position = expandedChunk.idx * expandedChunk.height;
      scrollEl!.current!.scrollTo({ x: 0, y: position, animated: true });
    }
    return () => {
      _mounted = false;
    };
  }, [expandedChunk]);

  const getChunkArray = (data: Tag[]) => {
    const chunkArray: any = [];

    data.forEach((item, i) => {
      const sectionProp = isRegion ? item.category1 : item.category2;
      const keyProp = isRegion ? item.category2 : item.category3;

      let lastItem = false;
      if (i === data.length - 1) {
        lastItem = true;
      }
      if (keyProp) {
        if (chunkArray.length !== 0) {
          const index = chunkArray.findIndex((o: any) => o.name === sectionProp);
          if (index === -1) {
            chunkArray.push({
              name: sectionProp,
              children: [
                {
                  name: keyProp,
                  id: item.id,
                  subscriberCounter: item.subscriberCounter,
                  taggedClassCounter: item.taggedClassCounter,
                  lastItem,
                },
              ],
            });
          } else {
            chunkArray[index].children.push({
              name: keyProp,
              id: item.id,
              subscriberCounter: item.subscriberCounter,
              taggedClassCounter: item.taggedClassCounter,
              lastItem,
            });
          }
        } else {
          chunkArray.push({
            name: sectionProp,
            children: [
              {
                name: keyProp,
                id: item.id,
                subscriberCounter: item.subscriberCounter,
                taggedClassCounter: item.taggedClassCounter,
                lastItem,
              },
            ],
          });
        }
      } else {
        chunkArray.push({
          name: sectionProp,
          id: item.id,
          subscriberCounter: item.subscriberCounter,
          taggedClassCounter: item.taggedClassCounter,
          lastItem,
        });
      }
    });
    return chunkArray;
  };

  const chunkArray = getChunkArray(data);

  if (data.length === 0) {
    return <Loading origin="TabTagList" />;
  }
  return (
    <ScrollView
      ref={scrollEl}
      keyboardDismissMode="on-drag"
      onScrollBeginDrag={Keyboard.dismiss}
      alwaysBounceVertical={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={
        isSearchTerm && !isSubsScreen ? styles.searchScrollContentContainerStyle : styles.scrollContentContainerStyle
      }
    >
      <List.Section style={styles.fullWidth}>
        {chunkArray.map((item: KeywordTagItems, idx: number) => {
          if (!item.children) {
            const checked = selectedTags.includes(item.id);

            return (
              <TagItem
                item={item}
                key={item.id}
                checked={checked}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                snackbarDispatch={snackbarDispatch}
                selectLimit={isSubsScreen ? USER_TAG_LIMIT : isRegion ? 1 : CLASS_TAG_LIMIT}
                appearance={appearance}
              />
            );
          } else {
            return (
              <ChunkRender
                children={item.children}
                name={item.name}
                key={item.name}
                idx={idx}
                expandedChunk={expandedChunk}
                setExpandedChunk={setExpandedChunk}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                isRegion={isRegion}
                isSubsScreen={isSubsScreen}
                snackbarDispatch={snackbarDispatch}
                appearance={appearance}
              />
            );
          }
        })}
      </List.Section>
    </ScrollView>
  );
};

const getThemedStyles = (theme: any, isSearchTerm: boolean) =>
  StyleSheet.create({
    searchScrollContentContainerStyle: {
      marginTop: 0,
      paddingTop: 0,
      backgroundColor: theme.colors.uiBackground,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column',
      paddingBottom: theme.size.normal,
    },
    scrollContentContainerStyle: {
      // marginTop: theme.size.xl,
      // paddingTop: theme.size.normal,
      backgroundColor: isSearchTerm ? theme.colors.uiBackground : theme.colors.background,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column',
      paddingBottom: 200,
    },
    fullWidth: { width: '100%' },
  });

export default memo(TabTagList);
