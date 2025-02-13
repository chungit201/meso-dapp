export const handlePushErrorToGoogleSheet = (wallet: string, error: string) => {
  fetch('/api/submit-error', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallet,
      url: window.location.href,
      error,
    }),
  }).catch(console.log)
}
