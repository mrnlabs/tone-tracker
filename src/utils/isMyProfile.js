import { useAuth } from "@/stores/auth";

/**
 * Check if the given user is the current user.
 *
 * @param {Object} user The user to check.
 * @returns {boolean} True if the user is the current user, false otherwise.
 */
const isMyProfile = (user) => {
  const auth = useAuth();
  const currentUser = JSON.parse(auth.user);
  return user.id === currentUser.id;
};

export default isMyProfile;
