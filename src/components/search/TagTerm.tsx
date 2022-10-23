import { IconButton } from 'react-native-paper';
import React, { memo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';
import MyChip from '../MyChip';
import { MySnackbarAction } from '../MySnackbar';
import SelectTags from '../SelectTags';
import { USER_TAG_LIMIT } from '../../configs/variables';

import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props {
  termDispatch: (arg: {}) => void;
  handleClose: () => void;
  tagTerm: string[];
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const TagTerm = ({ termDispatch, handleClose, tagTerm, snackbarDispatch }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);
  const [selectedTags, setSelectedTags] = useState<string[]>(tagTerm);
  const [width, setWidth] = useState(0);
  const scrollEl = useRef(null);

  const _handleSetTerm = () => {
    termDispatch({ type: 'setTerm', tagTerm: selectedTags });
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
        <ThemedButton mode="text" compact onPress={_handleSetTerm} disabled={!selectedTags?.[0]}>
          선택한 키워드로 설정
        </ThemedButton>
      </View>
      <View style={compStyles.searchKeywordTermBlock}>
        <KoreanParagraph
          text={`아래에서 검색하고자 하는 키워드를 최대 ${USER_TAG_LIMIT}개 까지 선택하세요. 여러 개를 선택하시면 모두 해당하는 클래스를 검색합니다.`}
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
          <Text style={compStyles.text}>선택한 키워드: </Text>

          {selectedTags?.map((tag: string) => {
            return <MyChip name={tag} key={tag} onPress={_handleChooseTag(tag)} fullName cancelButton={cancelButton} />;
          })}
        </ScrollView>
      </View>
      <View style={compStyles.flex1}>
        <SelectTags
          isSearchTerm
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          isSubsScreen
          shadowNeedless
          snackbarDispatch={snackbarDispatch}
        />
      </View>
    </View>
  );
};

export default memo(TagTerm);
