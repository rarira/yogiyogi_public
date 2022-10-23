import addWeeks from 'date-fns/add_weeks';
import format from 'date-fns/format';
import koLocale from 'date-fns/locale/ko';
import uuidv4 from 'uuid/v4';

const getExitroomMessageInput = (
  notiSenderId: string,
  senderName: string,
  notiReceiverId: string,
  notiConvId: string,
) => {
  const createdAt = new Date().toISOString();
  const expiresAt = Number(format(addWeeks(createdAt, 2), 'X'));
  const messageInput = {
    notiId: uuidv4(),
    notiReceiverId,
    notiSenderId,
    senderName,
    content: `${senderName}님이 ${format(createdAt, 'A h:mm', {
      locale: koLocale,
    })}에 채팅방을 퇴장하셨습니다. 다시 메시지를 보내 채팅을 재개하실 수 있습니다.`,
    extraInfo: 'exit',
    createdAt,
    expiresAt,
    notiConvId,
  };
  return messageInput;
};

export default getExitroomMessageInput;
