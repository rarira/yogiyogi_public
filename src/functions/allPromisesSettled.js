export function allPromisesSettled(promises) {
  const onFulfilled = value => ({
    status: 'fulfilled',
    value,
  });

  const onRejected = reason => ({
    status: 'rejected',
    reason,
  });

  const settledPromises = promises.map(promise => Promise.resolve(promise).then(onFulfilled, onRejected));

  return Promise.all(settledPromises);
}
