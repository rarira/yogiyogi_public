const getFormURL = (email: string, deviceInfo: string) => {
  return `https://docs.google.com/forms/d/e/1FAIpQLSeC7NvLoAUAr6Nzosr9-zE9PsgnTH0_Hwfj5IVmLfEv6wQ71g/viewform?usp=pp_url&entry.1510550566=${email}&entry.398506309=${deviceInfo}`;
};

export default getFormURL;
