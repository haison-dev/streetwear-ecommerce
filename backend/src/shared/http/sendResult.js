export const sendResult = (res, result) => {
  if (!result) return res.sendStatus(204);
  if (result.status === 204) return res.sendStatus(204);
  if (result.body === null || result.body === undefined) return res.sendStatus(result.status || 204);
  return res.status(result.status || 200).json(result.body);
};

