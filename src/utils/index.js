export function userRolesTransformer(rolesArray) {
    if(rolesArray) {
        return rolesArray.map(item => {          
            let label = item
              .toLowerCase()
              .split('_')
              .slice(1)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '); 
             
            return {
              label: label || item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(), // For non "TTG" items like CLIENT or SUPPLIER
              value: item
            };
          });
    }
    return []
}

export function formatSingleRole(role) {
    let label = role
      .toLowerCase()
      .split('_')
      .slice(1)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '); 
    return label || role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/**
 * Converts a gender string to proper case
 * @param {string} gender Gender string, e.g. MALE or FEMALE
 * @returns {string} Proper case gender string, e.g. Male or Female
 */
export  function getGender(gender) {
     return gender?.charAt(0).toUpperCase() + gender?.slice(1).toLowerCase();
}

export function formatSizes(size) {
  //sizes = X_SMALL, SMALL, MEDIUM, LARGE, X_LARGE, XX_LARGE, XXX_LARGE
  //for example X_SMALL should be X Small, X_LARGE should be X Large etc

  let label = size?.toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '); 
  return label
}

export function generatePassword() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let passwordLength = 8;
  let password = '';
  for (let i = 0; i < passwordLength; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
}