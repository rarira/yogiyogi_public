const getUsername = (id: string, name: string | null) => {
  if (name) return name;
  if (id.startsWith('Kakao_')) return '카카오유저';
  if (id.startsWith('Apple_')) return '애플유저';
  return id;
};

export default getUsername;
