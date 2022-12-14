import { IconButton } from 'react-native-paper';
import React, { memo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { INFO_POST_TAG_LIMIT } from '../../configs/variables';
import KoreanParagraph from '../KoreanParagraph';
import MyChip from '../MyChip';
import { MySnackbarAction } from '../MySnackbar';
import { SET_ADD_POST_STATE } from '../../stores/actionTypes';
import SelectTags from '../SelectTags';

import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';
import { getCompStyles } from '../../configs/compStyles';

interface Props {
  handleClose: () => void;

  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const PostTags = ({ handleClose, snackbarDispatch }: Props) => {
  const {
    postStore: { postTags: tagTerm },
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const [selectedTags, setSelectedTags] = useState<string[]>(tagTerm);
  const [width, setWidth] = useState(0);
  const scrollEl = useRef(null);
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const _handleSetTerm = () => {
    storeDispatch({ type: SET_ADD_POST_STATE, postTags: selectedTags });
    handleClose();
  };

  const _handleChooseTag = (tag: string) => () => {
    let nextChoosedTag: string[];
    if (selectedTags?.includes(tag)) {
      nextChoosedTag = selectedTags.filter((item: string) => item !== tag);
    } else {
      nextChoosedTag = (selectedTags || []).concat([tag]);
    }
    setSelectedTags(nextChoosedTag);
  };

  const _handleScrollSizeChanged = (newWidth: number, newHeight: number) => {
    if (newWidth > width && scrollEl?.current) {
      scrollEl!.current!.scrollToEnd({ animated: true });
    }
    setWidth(width);
  };

  const cancelButton = (id: String) => {
    const _handleDeleteTag = () => {
      const newTags = selectedTags.filter((o: string) => o !== id);
      setSelectedTags(newTags);
    };
    return (
      <IconButton
        icon="cancel"
        color={theme.colors.accent}
        size={theme.fontSize.big}
        onPress={_handleDeleteTag}
        style={compStyles.cancelButton}
        rippleColor="transparent"
        hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      />
    );
  };
  return (
    <View style={compStyles.searchContainer}>
      <View style={compStyles.buttons}>
        <ThemedButton
          mode="text"
          compact
          color={theme.colors.accent}
          onPress={handleClose}
          style={compStyles.buttonMarginRight}
        >
          ??????
        </ThemedButton>
        <ThemedButton mode="text" compact onPress={_handleSetTerm}>
          ????????? ???????????? ??????
        </ThemedButton>
      </View>
      <View style={compStyles.searchKeywordTermBlock}>
        <KoreanParagraph
          text={`???????????? ??????????????? ?????? ???????????? ?????? ${INFO_POST_TAG_LIMIT}??? ?????? ???????????????. ?????? ???????????? ???????????? ?????? ??????????????? ????????? ???????????????`}
          textStyle={compStyles.guideText}
          paragraphStyle={compStyles.guideParagraph}
        />
        <ScrollView
          ref={scrollEl}
          alwaysBounceHorizontal={false}
          contentContainerStyle={compStyles.searchKeywordTermContainer}
          horizontal={true}
          // snapToEnd={true}
          onContentSizeChange={_handleScrollSizeChanged}
        >
          <Text style={compStyles.text}>????????? ?????????: </Text>

          {selectedTags?.map((tag: string) => {
            return <MyChip name={tag} key={tag} onPress={_handleChooseTag(tag)} fullName cancelButton={cancelButton} />;
          })}
        </ScrollView>
      </View>
      <View style={compStyles.flex1}>
        <SelectTags
          isSearchTerm
          isPostTags
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          shadowNeedless
          snackbarDispatch={snackbarDispatch}
        />
      </View>
    </View>
  );
};

export default memo(PostTags);
