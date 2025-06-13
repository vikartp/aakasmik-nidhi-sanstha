/**
 * Generates a secret key for the user.
 * This key is used for account creation and password reset.
 * It should be a secure, random string.
 * @returns {string} A secure random string to be used as a secret key.
 */
export const generateRandomString = () : string =>  {
  // Define character sets
  const specialCharacters = ["@", "-", "#", "&", "%", "_"];
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  // Combine all character sets
  const allCharacters = alphabets + numbers + specialCharacters.join("");

  // Generate a 10 character password-like string
  let result = "";

  for (let i = 0; i < 10; i++) {
    result += allCharacters.charAt(
      Math.floor(Math.random() * allCharacters.length)
    );
  }

  return result;
}
