/**
 * Format a file size in bytes to a human-readable string, using a binary prefix
 * (KB, MB, GB, TB) and two decimal places.
 *
 * @param {number} size the file size in bytes
 * @return {string} a human-readable string representing the file size
 */
const formatFileSize = (size) => {
  if (size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formattedSize = (size / Math.pow(1024, i)).toFixed(2);
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  return `${formattedSize} ${units[i]}`;
};

  export default formatFileSize;