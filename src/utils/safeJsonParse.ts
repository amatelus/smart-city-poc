export const safeJsonParse = (text: unknown): unknown => {
  if (typeof text !== 'string') return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
