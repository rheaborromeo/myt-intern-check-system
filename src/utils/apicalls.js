import axios from "axios";
import { getRequester, getToken } from "../utils/commons";
import { message } from "antd";
import CryptoJS from "crypto-js";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 error (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      message.error("Session expired. Logging out now...");
      setTimeout(() => {
        window.location.href = "/login"; // Redirect to the login page after 1 second
      }, 1000000000);
    }
    return Promise.reject(error);
  }
);

export const encryptPayload = (data) => {
  const dataString = JSON.stringify(data);
  const secretKey = CryptoJS.enc.Utf8.parse("0123456789abcdef");
  const iv = CryptoJS.enc.Utf8.parse("abcdef9876543210");
  const encryptedPayload = CryptoJS.AES.encrypt(dataString, secretKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  return encryptedPayload;
};

// export const decryptData = (encryptedData) => {
//   const secretKey = CryptoJS.enc.Utf8.parse("1l0v3yoVvirUs$es")
//   const iv = CryptoJS.enc.Utf8.parse("abcdef9876543210")

//   const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7,
//   })

//   const decryptedString = decryptedData.toString(CryptoJS.enc.Utf8)

//   return JSON.parse(decryptedString)
// }

// export const decryptData = (encryptedData) => {
//   const secretKey = CryptoJS.enc.Utf8.parse("1l0v3yoVvirUs$es"); // 16-byte key

//   // Base64 decode the encrypted data to get the IV and encrypted string
//   const decodedData = CryptoJS.enc.Base64.parse(encryptedData).toString(
//     CryptoJS.enc.Hex
//   );

//   // Extract the IV from the decoded data (first 32 hex characters = 16 bytes)
//   const iv = CryptoJS.enc.Hex.parse(decodedData.substring(0, 32));

//   // Extract the actual encrypted part (the remaining hex string after the IV)
//   const encryptedPart = CryptoJS.enc.Hex.parse(decodedData.substring(32));

//   // Perform decryption using the key and IV
//   const decrypted = CryptoJS.AES.decrypt(
//     { ciphertext: encryptedPart },
//     secretKey,
//     { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
//   );

//   // Return the decrypted data as a UTF-8 string
//   return decrypted.toString(CryptoJS.enc.Utf8);
// };

export const postRequest = async (
  apiName,
  data = {},
  isFormData = false
) => {
  const url = `${BASE_URL}${apiName}`;

  const headers = {
    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    "API-KEY": API_KEY,
  };
  const payload = {
    token: getToken(),
    requester: getRequester(),
    ...data,
  };
  // const encryptedPayload = encryptPayload(payload);

  try {
    const response = await axios.post(
      url,
      // { signature: encryptedPayload },
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

export const postRequestV2 = async (
  apiName,
  data = {},
  isFormData = false
) => {
  const url = `${BASE_URL}${apiName}`;

  const headers = {
    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    "API-KEY": API_KEY,
  };
  const payload = {
    ...data,
    token: getToken(),
    requester: getRequester(),
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return response;
  } catch (error) {
    return error;
  }
};

// Get request function
export const getRequest = async (
  apiName,
  params = {},
  isFormData = false
) => {
  const url = `${BASE_URL}/${apiName}`;
  const headers = {
    "Content-Type": "application/json",
    "API-KEY": API_KEY,
  };
  const payload = {
    ...params,
    token: getToken(),
    requester: getRequester(),
  };
  try {
    const response = await axios.get(url, {
      params: payload,
      headers: headers,
    });
    return response.data;
  } catch (error) {
    return error;
  }
};
