import User from '../../models/userModel.js';

/**
 * Generates a unique username by appending random numbers if necessary
 * @param {string} baseUsername - The base username derived from the user's name
 * @returns {string} - A unique username
 */
export const generateRandomUsername = async (baseUsername) => {
  // Check if the baseUsername is available
  const existingUser = await User.findOne({ username: baseUsername });
  
  if (!existingUser) {
    return baseUsername;
  }
  
  // Add random numbers until we find an available username
  let isUnique = false;
  let username = '';
  
  while (!isUnique) {
    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    username = `${baseUsername}${randomNum}`;
    
    // Check if this username is available
    const user = await User.findOne({ username });
    
    if (!user) {
      isUnique = true;
    }
  }
  
  return username;
}; 