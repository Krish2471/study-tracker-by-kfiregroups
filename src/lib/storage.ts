export const getAccountId = () => {
  return 'local-cloud-account';
};

export const setAccountId = (id: string) => {
  localStorage.setItem('hash-current-account-id', id);
  sessionStorage.removeItem('hash_session_launched');
  window.location.reload();
};

export const getStorageKey = (name: string) => {
  return `${name}-${getAccountId()}`;
};
