require("dotenv").config();
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bucketName = process.env.AWS_BUCKET;

let methods = {
  hashPassword: (password) => {
    return new Promise((resolve, reject) => {
      Bcrypt.hash(password, 10, (err, passwordHash) => {
        if (err) {
          reject(err);
        } else {
          resolve(passwordHash);
        }
      });
    });
  },

  comparePassword: (pw, hash) => {
    return new Promise((resolve, reject) => {
      Bcrypt.compare(pw, hash, function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },

  // issueToken: (payload) => {
  //   return new Promise((resolve, reject) => {
  //     jwt.sign(
  //       payload,
  //       process.env.JWT_SECRET,
  //       { expiresIn: "7d" },
  //       (err, accessToken) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           jwt.sign(
  //             payload,
  //             process.env.JWT_SECRET,
  //             { expiresIn: "30d" },
  //             (err) => {
  //               if (err) {
  //                 reject(err);
  //               } else {
  //                 resolve({ accessToken });
  //               }
  //             }
  //           );
  //         }
  //       }
  //     );
  //   });
  // },
  
  issueToken: (payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "90d" }, // 3 months
        (err, accessToken) => {
          if (err) {
            reject(err);
          } else {
            resolve({ accessToken });
          }
        }
      );
    });
  },
  
  verifyToken: (token, cb) => jwt.verify(token, process.env.JWT_SECRET, {}, cb),

  uploadFile: async (file, access = "Private") => {
    file.name = file.name.replace(/\s/g, "").replace("#", "").replace('"', "");
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    const fileNameWithoutExtension =
      "fileupload/" +
      Date.now() +
      "/" +
      file.name.substring(0, file.name.lastIndexOf("."));
    let fileName = `${fileNameWithoutExtension}${fileExtension}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      ContentDisposition: "inline",
      ContentType: file.mimetype,
      Body: file.data,
    };

    // Set ACL based on access parameter
    if (access === "Public") {
      uploadParams.ACL = "public-read";
    } else {
      // Private by default - no ACL means bucket-owner-full-control
      uploadParams.ACL = "private";
    }

    try {
      const data = await s3.upload(uploadParams).promise();
      return {
        ...data,
        isPublic: access === "Public"
      };
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  },

  // Generate pre-signed URL for private file access
  generatePresignedUrl: async (s3Key, expiresIn = 3600) => {
    try {
      const params = {
        Bucket: bucketName,
        Key: s3Key,
        Expires: expiresIn // URL expires in seconds (default 1 hour)
      };
      
      const url = await s3.getSignedUrlPromise('getObject', params);
      return {
        success: true,
        url: url,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + (expiresIn * 1000)).toISOString()
      };
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Extract S3 key from full S3 URL
  extractS3Key: (s3Url) => {
    try {
      const url = new URL(s3Url);
      
      // Handle different S3 URL formats:
      // 1. https://s3.amazonaws.com/bucket-name/key/path
      // 2. https://bucket-name.s3.amazonaws.com/key/path
      // 3. https://bucket-name.s3.region.amazonaws.com/key/path
      
      if (url.hostname === 's3.amazonaws.com') {
        // Format: https://s3.amazonaws.com/bucket-name/key/path
        // Remove leading slash and bucket name
        const pathParts = url.pathname.substring(1).split('/');
        if (pathParts.length > 1) {
          return pathParts.slice(1).join('/'); // Remove bucket name, return key
        }
      } else if (url.hostname.includes('s3.amazonaws.com') || url.hostname.includes('s3.')) {
        // Format: https://bucket-name.s3.amazonaws.com/key/path
        // Remove leading slash and return the key
        return url.pathname.substring(1);
      }
      
      // If none of the above formats match, return the pathname without leading slash
      return url.pathname.substring(1);
    } catch (error) {
      // If it's already just a key (not a full URL), return as is
      return s3Url;
    }
  },
};

module.exports = methods;
