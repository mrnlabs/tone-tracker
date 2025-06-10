/**
 * Generates an SVG avatar with the specified width, height, and random background color.
 * The avatar contains the initials of the provided first and last names.
 *
 * @param {string} firstName - The first name to use for the avatar initials.
 * @param {string} lastName - The last name to use for the avatar initials.
 * @param {number} [width=100] - The width of the avatar in pixels.
 * @param {number} [height=100] - The height of the avatar in pixels.
 * @return {string} A Base64 encoded string representing the SVG avatar.
 */
function avatarGenerator(firstName, lastName, width = 100, height = 100) {
    // Generate initials
    const initials = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
  
    // Generate a random background color
    const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  
    // Create SVG with specified width, height, and random background color
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        <text x="50%" y="50%" font-size="${Math.min(width, height) / 2.5}" fill="#FFFFFF" text-anchor="middle" alignment-baseline="central" font-family="Arial, sans-serif">
          ${initials}
        </text>
      </svg>
    `;
  
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  
  export default avatarGenerator;
  