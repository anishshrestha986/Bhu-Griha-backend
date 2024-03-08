export const createOTP = (length = 6): string => {
  const rand = Math.random();
  let otp = Math.floor(rand * Math.pow(10, length)).toString();

  if (otp.length < length) {
    otp = otp.padStart(length, '0');
  }

  return otp;
};
