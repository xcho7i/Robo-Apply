let User = require("../models/user.model")
let bcrypt = require("bcrypt")
let axios = require("axios")
const jwt = require("jsonwebtoken")
let utils = require("../utils/index")
const services = require("../helpers/services")
const randomstring = require("randomstring")
const { OAuth2Client } = require("google-auth-library")
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const path = require("path")
const mongoose = require("mongoose")
const subscriptionPlanModel = require("../models/subscriptionPlans.model")
const UserSubscription = require("../models/userSubscriptionModel")
const PaymentHistory = require("../models/paymentHistory.model")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const AWS = require("aws-sdk")
const userJobApplicationHistoryModel = require("../models/userJobApplicationHistory.model")
const userSubscriptionModel = require("../models/userSubscriptionModel")

const JobsActivity = require("../models/jobsActivity.model")

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

let methods = {
  seedAllSubscriptionPlans: async (req, res) => {
    try {
      // You can also validate admin access here using req.token.role, etc.

      const plans = require("../subscription_plans_all.json") // adjust path if using file

      if (!plans || plans.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No plan data available to seed." })
      }

      // Optional: Clear previous records if needed
      await subscriptionPlanModel.deleteMany({})

      // Insert all plans
      await subscriptionPlanModel.insertMany(plans)

      return res.status(201).json({
        success: true,
        message: `${plans.length} subscription plans have been seeded successfully.`
      })
    } catch (error) {
      console.error("Error seeding subscription plans:", error)
      return res.status(500).json({
        success: false,
        message: "Server error while seeding subscription plans."
      })
    }
  },
  addUser: async (req, res) => {
    try {
      let data = req.body

      if (!data || !data.email || !data.password) {
        return res.status(400).json({
          msg: "Please provide valid user data (email and password required)",
          success: false
        })
      }

      // Check if user with the same email already exists
      const existingUser = await User.findOne({ email: data.email })
      if (existingUser) {
        return res.status(200).json({
          msg: "User with this Email Already exists.",
          success: false
        })
      }

      // Hash password
      data.password = await bcrypt.hash(data.password, 10)

      data.isFreePlanExpired = false

      // Create and save user
      const user = new User(data)
      // user.credits = 60;
      user.isNewUser = true
      const addUser = await user.save()

      if (!addUser) {
        return res.status(500).json({
          msg: "Failed to add user",
          success: false
        })
      }

      //Assigning default free plan to a user

      // const plan = await subscriptionPlanModel.findOne({
      //   identifier: "free_plan"
      // })
      // if (!plan) {
      //   console.log("❌ Subscription plan not found")
      // }

      // const planSnapshot = {
      //   name: plan.name,
      //   identifier: plan.identifier,
      //   billingCycle: plan.billingCycle,
      //   price: plan.price,
      //   dailyLimit: plan.jobLimits.dailyLimit,
      //   monthlyCredits: 0,
      //   resumeProfiles: plan.resumeProfiles,
      //   freeTailoredResumes: plan.freeTailoredResumes,
      //   freeAutoApplies: plan.freeAutoApplies,
      //   includesAutoApply: plan.includesAutoApply,
      //   includesResumeBuilder: plan.includesResumeBuilder,
      //   includesResumeScore: plan.includesResumeScore,
      //   includesAICoverLetters: plan.includesAICoverLetters,
      //   includesInterviewBuddy: plan.includesInterviewBuddy,
      //   includesTailoredResumes: plan.includesTailoredResumes,
      //   descriptionNote: plan.descriptionNote
      // }

      // // Create user subscription record
      // await userSubscriptionModel.create({
      //   userId: addUser._id,
      //   subscriptionPlanId: plan._id,
      //   planSnapshot,
      //   usage: {
      //     jobApplicationsToday: 0,
      //     monthlyCreditsUsed: 0,
      //     resumeProfilesUsed: 0,
      //     tailoredResumesUsed: 0,
      //     autoAppliesUsed: 0,
      //     jobDescriptionGenerations: 0,
      //     jobSkillsGenerations: 0,
      //     jobTitleGenerations: 0,
      //     generationsWithoutTailoring: 0,
      //   },
      //   startDate: new Date(),
      //   endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days for free trial
      //   isActive: true
      // })

      return res.status(200).json({
        user: addUser,
        msg: "User added successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to add user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  setNewPassword: async (req, res) => {
    try {
      const userId = req.token._id // ✅ Authenticated user ID
      const { newPassword } = req.body

      if (!newPassword) {
        return res.status(400).json({
          msg: "Please provide a new password",
          success: false
        })
      }

      // Find the user by ID
      const user = await User.findOne({ _id: userId })
      if (!user) {
        return res.status(404).json({
          msg: "User not found",
          success: false
        })
      }

      // Get email from the user object (if needed later)
      const email = user.email

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      user.password = hashedPassword
      await user.save()

      return res.status(200).json({
        msg: "Password updated successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to update password",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  viewUser: async (req, res) => {
    try {
      const userId = req.token._id

      let user = await User.findOne({ _id: userId })
      if (!user) {
        return res.status(404).json({
          msg: "User not found",
          success: false
        })
      }

      return res.status(200).json({
        user: user,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to view user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  getUser: async (req, res) => {
    try {
      const paginateOptions =
        req.query.page && req.query.limit
          ? { page: parseInt(req.query.page), limit: parseInt(req.query.limit) }
          : { page: 1, limit: 10 }

      const allUsers = await User.paginate(
        { deleted: false },
        { ...paginateOptions }
      )
      return res.status(200).json({
        user: allUsers,
        success: true
      })
    } catch (error) {
      console.error("Error fetching users:", error)
      return res.status(500).json({
        msg: "Failed to view user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  // updateUser: async (req, res) => {
  //   try {
  //     let userId = req.body._id;
  //     let data = req.body;
  //     if (!data) {
  //       return res.status(400).json({
  //         msg: "Please provide user data to update",
  //         success: false,
  //       });
  //     }

  //     delete data.deleted;
  //     delete data.password;

  //     let updateUser = await User.findByIdAndUpdate(userId, data, {
  //       new: true,
  //     });

  //     if (!updateUser) {
  //       return res.status(404).json({
  //         msg: "User not found",
  //         success: false,
  //       });
  //     }

  //     return res.status(200).json({
  //       user: updateUser,
  //       msg: "User updated successfully",
  //       success: true,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Failed to update user",
  //       error: error.message || "Something went wrong.",
  //       success: false,
  //     });
  //   }
  // },

  updateUser: async (req, res) => {
    try {
      let _id = req.token._id
      const { data } = req.body // Destructure _id and data from the request body

      if (!data) {
        return res.status(400).json({
          msg: "Please provide user data to update",
          success: false
        })
      }

      delete data.deleted // Removing any fields you don't want to update
      delete data.password

      let updateUser = await User.findByIdAndUpdate(_id, data, { new: true })

      if (!updateUser) {
        return res.status(404).json({
          msg: "User not found",
          success: false
        })
      }

      return res.status(200).json({
        user: updateUser,
        msg: "User updated successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to update user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  deleteUser: async (req, res) => {
    try {
      let userId = req.query.id

      let deleteUser = await User.findOneAndUpdate(
        { _id: userId },
        { status: "deleted", deleted: true }
      )

      if (!deleteUser) {
        return res.status(404).json({
          msg: "User not found",
          success: false
        })
      }
      return res.status(200).json({
        msg: "User deleted successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to delete user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  enableUser: async (req, res) => {
    try {
      let adminId = req.token._id
      let userId = req.query.id

      let enableUser = await User.findOneAndUpdate(
        { _id: userId },
        { deleted: false },
        { new: true }
      )

      if (!enableUser) {
        return res.status(404).json({
          msg: "User not found",
          success: false
        })
      }

      return res.status(200).json({
        msg: "User enabled successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to enable user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  // googleCallBackHandler: async (req, res) => {
  //   try {
  //     const { idToken } = req.body; // Get the ID token from the request

  //     if (!idToken) {
  //       return res.status(401).json({
  //         status: false,
  //         message: "Google ID token is missing or invalid",
  //       });
  //     }

  //     try {
  //       // Verify the ID token
  //       const ticket = await client.verifyIdToken({
  //         idToken,
  //         audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  //       });
  //       const payload = ticket.getPayload(); // Get user info from the token

  //       let user = await User.findOne({ email: payload.email });

  //       if (!user) {
  //         // New user: Create the user in the database
  //         const encryptedPassword = await bcrypt.hash("", 10); // No password for OAuth users
  //         user = new User({
  //           email: payload.email,
  //           password: encryptedPassword,
  //           firstName: payload.given_name || "",
  //           lastName: payload.family_name || "",
  //           imageUrl: payload.picture || "",
  //           verified: true,
  //         });

  //         await user.save();

  //         // Create a JWT token for the new user
  //         const accessToken = jwt.sign(
  //           { _id: user._id },
  //           process.env.JWT_SECRET,
  //           {
  //             expiresIn: "30d",
  //           }
  //         );

  //         let result = {
  //           user: user,
  //           accessToken,
  //         };

  //         return res.status(200).json({
  //           status: true,
  //           message: "User logged in successfully",
  //           result,
  //         });
  //       } else {
  //         // Existing user: Create JWT token
  //         const accessToken = jwt.sign(
  //           { _id: user._id },
  //           process.env.JWT_SECRET,
  //           {
  //             expiresIn: "30d",
  //           }
  //         );

  //         user.password = null; // Do not return the password
  //         let result = {
  //           user,
  //           accessToken,
  //         };

  //         return res.status(200).json({
  //           status: true,
  //           message: "User logged in successfully",
  //           result,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error verifying ID token:", error);
  //       return res.status(401).json({
  //         status: false,
  //         message: "Invalid ID token",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Internal server error:", error);
  //     return res.status(500).json({
  //       status: false,
  //       message: "Failed to fetch user profile",
  //     });
  //   }
  // },

  //   googleCallBackHandler: async (req, res) => {
  //   try {
  //     const { idToken } = req.body;

  //     if (!idToken) {
  //       return res.status(401).json({
  //         status: false,
  //         message: "Google ID token is missing or invalid",
  //       });
  //     }

  //     const ticket = await client.verifyIdToken({
  //       idToken,
  //       audience: process.env.GOOGLE_CLIENT_ID,
  //     });

  //     const payload = ticket.getPayload();
  //     let user = await User.findOne({ email: payload.email });

  //     let isNewUser = false;

  //     if (!user) {
  //       const encryptedPassword = await bcrypt.hash("", 10);
  //       user = new User({
  //         email: payload.email,
  //         password: encryptedPassword,
  //         firstName: payload.given_name || "",
  //         lastName: payload.family_name || "",
  //         imageUrl: payload.picture || "",
  //         verified: true,
  //       });

  //       await user.save();
  //       isNewUser = true;
  //     }

  //     const accessToken = jwt.sign(
  //       { _id: user._id },
  //       process.env.JWT_SECRET,
  //       { expiresIn: "30d" }
  //     );

  //     const { password, ...dbUser } = user.toObject();

  //     const activeSub = await UserSubscription.findOne({
  //       userId: user._id,
  //       isActive: true,
  //     }).lean();

  //     if (activeSub) {
  //       const { planSnapshot, usage } = activeSub;
  //       const extraCredits = user.credits || 0;

  //       const remaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed) + extraCredits,
  //         extraCredits,
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         freeTailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         freeAutoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       dbUser.subscription = {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: activeSub.startDate,
  //         endDate: activeSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //       };
  //     }

  //     return res.status(200).json({
  //       status: true,
  //       message: isNewUser ? "User registered and logged in successfully" : "User logged in successfully",
  //       result: {
  //         user: dbUser,
  //         access_token: {
  //           accessToken,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     return res.status(500).json({
  //       status: false,
  //       message: "Login failed",
  //       error: error.message,
  //     });
  //   }
  // },

  googleCallBackHandler: async (req, res) => {
    try {
      const { idToken, access_token } = req.body

      // Either idToken or access_token is required
      if (!idToken && !access_token) {
        return res.status(401).json({
          status: false,
          message: "Either Google ID token or access token is required"
        })
      }

      let payload;

      if (idToken) {
        // Handle idToken flow (existing functionality)
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID
        })
        payload = ticket.getPayload()
      } else if (access_token) {
        // Handle access_token flow (new functionality)
        try {
          const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          })
          
          if (response.status !== 200 || !response.data.email) {
            return res.status(401).json({
              status: false,
              message: "Invalid access token or unable to fetch user information"
            })
          }

          // Map the userinfo response to match the idToken payload structure
          const userInfo = response.data
          payload = {
            email: userInfo.email,
            name: userInfo.name,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            picture: userInfo.picture,
            sub: userInfo.sub
          }
        } catch (apiError) {
          console.error("Google userinfo API error:", apiError)
          return res.status(401).json({
            status: false,
            message: "Invalid access token or failed to verify with Google"
          })
        }
      }

      let user = await User.findOne({ email: payload.email })
      let isNewUser = false

      // if (!user) {
      //   const encryptedPassword = await bcrypt.hash("", 10)
      //   user = new User({
      //     email: payload.email,
      //     password: encryptedPassword,
      //     firstName: payload.given_name || "",
      //     lastName: payload.family_name || "",
      //     imageUrl: payload.picture || "",
      //     verified: true,
      //     isNewUser:true,
      //     // credits:60
      //   })

      //   await user.save()
      //   isNewUser = true

      // }

      if (!user) {
        const encryptedPassword = await bcrypt.hash("", 10)

        // Get the best available full name
        const fullName =
          (payload.name && payload.name.trim()) ||
          [payload.given_name, payload.family_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          (payload.given_name || "").trim()

        // Split name into first and last
        const nameParts = fullName.split(/\s+/)
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""

        user = new User({
          email: payload.email,
          password: encryptedPassword,
          firstName,
          lastName,
          imageUrl: payload.picture || "",
          verified: true,
          isNewUser: true
          // credits: 60
        })

        await user.save()
        isNewUser = true
      }

      const accessToken = await utils.issueToken({
        _id: user._id,
        email: user.email
      })

      const { password, ...dbUser } = user.toObject()

      const activeSub = await UserSubscription.findOne({
        userId: user._id,
        isActive: true
      }).lean()

      if (activeSub) {
        const { planSnapshot, usage } = activeSub
        const extraCredits = user.credits || 0

        const remaining = {
          jobApplicationsToday: Math.max(
            0,
            planSnapshot.dailyLimit - usage.jobApplicationsToday
          ),
          monthlyCredits:
            Math.max(
              0,
              planSnapshot.monthlyCredits - usage.monthlyCreditsUsed
            ) + extraCredits,
          extraCredits,
          resumeProfiles: Math.max(
            0,
            planSnapshot.resumeProfiles - usage.resumeProfilesUsed
          ),
          freeTailoredResumes: Math.max(
            0,
            planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
          ),
          freeAutoApplies: Math.max(
            0,
            planSnapshot.freeAutoApplies - usage.autoAppliesUsed
          )
        }

        dbUser.subscription = {
          planName: planSnapshot.name,
          billingCycle: planSnapshot.billingCycle,
          startDate: activeSub.startDate,
          endDate: activeSub.endDate,
          dailyLimit: planSnapshot.dailyLimit,
          monthlyCredits: planSnapshot.monthlyCredits,
          usage,
          remaining
        }
      }

      return res.status(200).json({
        success: true,
        result: {
          user: dbUser,
          access_token: {
            accessToken: accessToken
          }
        }
      })

      // return res.status(200).json({
      //   success: true,
      //   message: isNewUser
      //     ? "User registered and logged in successfully"
      //     : "User logged in successfully",
      //   result: {
      //     user: dbUser,
      //     access_token: {
      //       accessToken,
      //     },
      //   },
      // });
    } catch (error) {
      console.error("Google login error:", error)
      return res.status(500).json({
        status: false,
        message: "Login failed",
        error: error.message
      })
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body
      const user = await User.findOne({ email })

      if (!user || user.otp !== otp) {
        return res.status(400).json({
          msg: "Invalid OTP",
          success: false
        })
      }

      // Update the user as verified
      user.verified = true
      user.otp = null // Clear OTP after successful verification
      await user.save()

      return res.status(200).json({
        msg: "User verified successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to verify user",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  //    loginUser : async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res.status(401).json({
  //         msg: "Please enter the correct credentials!",
  //         success: false,
  //       });
  //     }

  //     const user = await User.findOne({ email }).lean().exec();
  //     if (!user) {
  //       return res.status(404).json({
  //         msg: "User with this email does not exist",
  //         success: false,
  //       });
  //     }

  //     const match = await utils.comparePassword(password, user.password);
  //     if (!match) {
  //       return res.status(401).json({
  //         msg: "Wrong password entered",
  //         success: false,
  //       });
  //     }

  //     const access_token = await utils.issueToken({
  //       _id: user._id,
  //       email: user.email,
  //     });

  //     const { password: dbPass, ...dbUser } = user;

  //     // Fetch active subscription
  //     const activeSub = await UserSubscription.findOne({
  //       userId: user._id,
  //       isActive: true,
  //     }).lean();

  //     if (activeSub) {
  //       const { planSnapshot, usage } = activeSub;

  //       const remaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         freeTailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         freeAutoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       dbUser.subscription = {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: activeSub.startDate,
  //         endDate: activeSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //       };
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       result: {
  //         user: dbUser,
  //         access_token: {
  //           accessToken: access_token,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Login failed",
  //       error: error.message,
  //       success: false,
  //     });
  //   }
  // },

  // loginUser: async (req, res) => {
  //   try {
  //     const { email, password } = req.body

  //     if (!email || !password) {
  //       return res.status(401).json({
  //         msg: "Please enter the correct credentials!",
  //         success: false
  //       })
  //     }

  //     const user = await User.findOne({ email }).lean().exec()
  //     if (!user) {
  //       return res.status(404).json({
  //         msg: "User with this email does not exist",
  //         success: false
  //       })
  //     }

  //     const match = await utils.comparePassword(password, user.password)
  //     if (!match) {
  //       return res.status(401).json({
  //         msg: "Wrong password entered",
  //         success: false
  //       })
  //     }

  //     const access_token = await utils.issueToken({
  //       _id: user._id,
  //       email: user.email
  //     })

  //     const { password: dbPass, ...dbUser } = user

  //     // Fetch active subscription
  //     const activeSub = await UserSubscription.findOne({
  //       userId: user._id,
  //       isActive: true
  //     }).lean()

  //     if (activeSub) {
  //       const { planSnapshot, usage } = activeSub
  //       const extraCredits = user.credits || 0

  //       const remaining = {
  //         jobApplicationsToday: Math.max(
  //           0,
  //           planSnapshot.dailyLimit - usage.jobApplicationsToday
  //         ),
  //         monthlyCredits:
  //           Math.max(
  //             0,
  //             planSnapshot.monthlyCredits - usage.monthlyCreditsUsed
  //           ) + extraCredits,
  //         extraCredits,
  //         resumeProfiles: Math.max(
  //           0,
  //           planSnapshot.resumeProfiles - usage.resumeProfilesUsed
  //         ),
  //         freeTailoredResumes: Math.max(
  //           0,
  //           planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
  //         ),
  //         freeAutoApplies: Math.max(
  //           0,
  //           planSnapshot.freeAutoApplies - usage.autoAppliesUsed
  //         )
  //       }

  //       dbUser.subscription = {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: activeSub.startDate,
  //         endDate: activeSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining
  //       }
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       result: {
  //         user: dbUser,
  //         access_token: {
  //           accessToken: access_token
  //         }
  //       }
  //     })
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Login failed",
  //       error: error.message,
  //       success: false
  //     })
  //   }
  // },

  //   loginUser: async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res.status(401).json({
  //         msg: "Please enter the correct credentials!",
  //         success: false,
  //       });
  //     }

  //     const user = await User.findOne({ email }).lean().exec();
  //     if (!user) {
  //       return res.status(404).json({
  //         msg: "User with this email does not exist",
  //         success: false,
  //       });
  //     }

  //     const match = await utils.comparePassword(password, user.password);
  //     if (!match) {
  //       return res.status(401).json({
  //         msg: "Wrong password entered",
  //         success: false,
  //       });
  //     }

  //     const access_token = await utils.issueToken({
  //       _id: user._id,
  //       email: user.email,
  //     });

  //     const { password: dbPass, ...dbUser } = user;

  //     // Fetch all active subscriptions (could be multiple: new + old cancel_at_period_end)
  //     const activeSubs = await UserSubscription.find({
  //       userId: user._id,
  //       isActive: true,
  //     }).lean();

  //     let totalRemaining = {
  //       jobApplicationsToday: 0,
  //       monthlyCredits: 0,
  //       extraCredits: user.credits || 0,
  //       resumeProfiles: 0,
  //       freeTailoredResumes: 0,
  //       freeAutoApplies: 0,
  //     };

  //     const subscriptionSummaries = [];

  //     if (activeSubs.length > 0) {
  //       for (const sub of activeSubs) {
  //         const { planSnapshot, usage } = sub;

  //         const subRemaining = {
  //           jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //           monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //           resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //           freeTailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //           freeAutoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //         };

  //         // Accumulate per-subscription values into totals
  //         totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday;
  //         totalRemaining.monthlyCredits += subRemaining.monthlyCredits;
  //         totalRemaining.resumeProfiles += subRemaining.resumeProfiles;
  //         totalRemaining.freeTailoredResumes += subRemaining.freeTailoredResumes;
  //         totalRemaining.freeAutoApplies += subRemaining.freeAutoApplies;

  //         subscriptionSummaries.push({
  //           planName: planSnapshot.name,
  //           billingCycle: planSnapshot.billingCycle,
  //           startDate: sub.startDate,
  //           endDate: sub.endDate,
  //           dailyLimit: planSnapshot.dailyLimit,
  //           monthlyCredits: planSnapshot.monthlyCredits,
  //           usage,
  //           remaining: subRemaining,
  //           cancelAt: sub.cancelAt || null,
  //         });
  //       }

  //       // Add user's extra credits once
  //       totalRemaining.monthlyCredits += totalRemaining.extraCredits;

  //       dbUser.subscriptions = subscriptionSummaries;
  //       dbUser.totalRemaining = totalRemaining;
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       result: {
  //         user: dbUser,
  //         access_token: {
  //           accessToken: access_token,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Login failed",
  //       error: error.message,
  //       success: false,
  //     });
  //   }
  // },

  // loginUser: async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res.status(401).json({
  //         msg: "Please enter the correct credentials!",
  //         success: false,
  //       });
  //     }

  //     const user = await User.findOne({ email }).lean().exec();
  //     if (!user) {
  //       return res.status(404).json({
  //         msg: "User with this email does not exist",
  //         success: false,
  //       });
  //     }

  //     const match = await utils.comparePassword(password, user.password);
  //     if (!match) {
  //       return res.status(401).json({
  //         msg: "Wrong password entered",
  //         success: false,
  //       });
  //     }

  //     const access_token = await utils.issueToken({
  //       _id: user._id,
  //       email: user.email,
  //     });

  //     const { password: dbPass, ...dbUser } = user;

  //     const activeSubs = await UserSubscription.find({ userId: user._id, isActive: true }).lean();

  //     let totalRemaining = {
  //       jobApplicationsToday: 0,
  //       monthlyCredits: 0,
  //       extraCredits: user.credits || 0,
  //       resumeProfiles: 0,
  //       freeTailoredResumes: 0,
  //       freeAutoApplies: 0,
  //     };

  //     let selectedSubscription = null;

  //     for (const sub of activeSubs) {
  //       const { planSnapshot, usage, isCancelled } = sub;

  //       const subRemaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         freeTailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         freeAutoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       // Accumulate all active subscriptions
  //       totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday;
  //       totalRemaining.monthlyCredits += subRemaining.monthlyCredits;
  //       totalRemaining.resumeProfiles += subRemaining.resumeProfiles;
  //       totalRemaining.freeTailoredResumes += subRemaining.freeTailoredResumes;
  //       totalRemaining.freeAutoApplies += subRemaining.freeAutoApplies;

  //       // Only assign the active and not cancelled one to user.subscription
  //       if (!isCancelled && !selectedSubscription) {
  //         selectedSubscription = {
  //           planName: planSnapshot.name,
  //           billingCycle: planSnapshot.billingCycle,
  //           startDate: sub.startDate,
  //           endDate: sub.endDate,
  //           dailyLimit: planSnapshot.dailyLimit,
  //           monthlyCredits: planSnapshot.monthlyCredits,
  //           usage,
  //           remaining: subRemaining,
  //           cancelAt: sub.cancelAt || null,
  //         };
  //       }
  //     }

  //     totalRemaining.monthlyCredits += totalRemaining.extraCredits;

  //     dbUser.subscription = selectedSubscription;
  //     dbUser.totalRemaining = totalRemaining;

  //     return res.status(200).json({
  //       success: true,
  //       result: {
  //         user: dbUser,
  //         access_token: {
  //           accessToken: access_token,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Login failed",
  //       error: error.message,
  //       success: false,
  //     });
  //   }
  // },

  // loginUser: async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res.status(401).json({
  //         msg: "Please enter the correct credentials!",
  //         success: false,
  //       });
  //     }

  //     const user = await User.findOne({ email }).lean().exec();
  //     if (!user) {
  //       return res.status(404).json({
  //         msg: "User with this email does not exist",
  //         success: false,
  //       });
  //     }

  //     const match = await utils.comparePassword(password, user.password);
  //     if (!match) {
  //       return res.status(401).json({
  //         msg: "Wrong password entered",
  //         success: false,
  //       });
  //     }

  //     const access_token = await utils.issueToken({
  //       _id: user._id,
  //       email: user.email,
  //     });

  //     const { password: dbPass, ...dbUser } = user;

  //     const activeSubs = await UserSubscription.find({ userId: user._id, isActive: true }).lean();

  //     let totalRemaining = {
  //       jobApplicationsToday: 0,
  //       monthlyCredits: 0,
  //       extraCredits: user.credits || 0,
  //       resumeProfiles: 0,
  //       freeTailoredResumes: 0,
  //       freeAutoApplies: 0,
  //     };

  //     let selectedSubscription = null;

  //     // First, gather all non-free active and non-cancelled subscriptions
  //     const preferredSubs = activeSubs.filter(
  //       sub => sub.planSnapshot?.identifier !== 'free_plan' && sub.isCancelled === false
  //     );

  //     let selectedSub = null;

  //     if (activeSubs.length === 1) {
  //       selectedSub = activeSubs[0]; // only one active sub, return it regardless
  //     } else if (preferredSubs.length > 0) {
  //       selectedSub = preferredSubs[0]; // return the first preferred one
  //     } else if (activeSubs.length > 0) {
  //       selectedSub = activeSubs[0]; // fallback: return the first active (even free)
  //     }

  //     for (const sub of activeSubs) {
  //       const { planSnapshot, usage } = sub;

  //       const subRemaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         freeTailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         freeAutoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday;
  //       totalRemaining.monthlyCredits += subRemaining.monthlyCredits;
  //       totalRemaining.resumeProfiles += subRemaining.resumeProfiles;
  //       totalRemaining.freeTailoredResumes += subRemaining.freeTailoredResumes;
  //       totalRemaining.freeAutoApplies += subRemaining.freeAutoApplies;
  //     }

  //     totalRemaining.monthlyCredits += totalRemaining.extraCredits;

  //     if (selectedSub) {
  //       const { planSnapshot, usage } = selectedSub;

  //       const remaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         freeTailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         freeAutoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       dbUser.subscription = {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: selectedSub.startDate,
  //         endDate: selectedSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         cancelAt: selectedSub.cancelAt || null,
  //       };
  //     } else {
  //       dbUser.subscription = null;
  //     }

  //     dbUser.totalRemaining = totalRemaining;

  //     return res.status(200).json({
  //       success: true,
  //       result: {
  //         user: dbUser,
  //         access_token: {
  //           accessToken: access_token,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       msg: "Login failed",
  //       error: error.message,
  //       success: false,
  //     });
  //   }
  // },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(401).json({
          msg: "Please enter the correct credentials!",
          success: false
        })
      }

      const user = await User.findOne({ email }).lean().exec()
      if (!user) {
        return res.status(404).json({
          msg: "User with this email does not exist",
          success: false
        })
      }

      const match = await utils.comparePassword(password, user.password)
      if (!match) {
        return res.status(401).json({
          msg: "Wrong password entered",
          success: false
        })
      }

      const access_token = await utils.issueToken({
        _id: user._id,
        email: user.email
      })

      const { password: dbPass, ...dbUser } = user

      const activeSubs = await UserSubscription.find({
        userId: user._id,
        isActive: true
      }).lean()

      let totalRemaining = {
        jobApplicationsToday: 0,
        monthlyCredits: 0,
        extraCredits: user.credits || 0,
        resumeProfiles: 0,
        freeTailoredResumes: 0,
        freeAutoApplies: 0
      }

      let selectedSubscription = null

      // First, gather all non-free active and non-cancelled subscriptions
      const preferredSubs = activeSubs.filter(
        (sub) =>
          sub.planSnapshot?.identifier !== "free_plan" &&
          sub.isCancelled === false
      )

      let selectedSub = null

      if (activeSubs.length === 1) {
        selectedSub = activeSubs[0] // only one active sub
      } else if (preferredSubs.length > 0) {
        selectedSub = preferredSubs[0] // preferred
      } else if (activeSubs.length > 0) {
        selectedSub = activeSubs[0] // fallback
      }

      for (const sub of activeSubs) {
        const { planSnapshot, usage, isTrialPeriod } = sub

        const effectiveMonthlyCredits = isTrialPeriod
          ? 60
          : planSnapshot.monthlyCredits

        const subRemaining = {
          jobApplicationsToday: Math.max(
            0,
            planSnapshot.dailyLimit - usage.jobApplicationsToday
          ),
          monthlyCredits: Math.max(
            0,
            effectiveMonthlyCredits - usage.monthlyCreditsUsed
          ),
          resumeProfiles: Math.max(
            0,
            planSnapshot.resumeProfiles - usage.resumeProfilesUsed
          ),
          freeTailoredResumes: Math.max(
            0,
            planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
          ),
          freeAutoApplies: Math.max(
            0,
            planSnapshot.freeAutoApplies - usage.autoAppliesUsed
          )
        }

        totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday
        totalRemaining.monthlyCredits += subRemaining.monthlyCredits
        totalRemaining.resumeProfiles += subRemaining.resumeProfiles
        totalRemaining.freeTailoredResumes += subRemaining.freeTailoredResumes
        totalRemaining.freeAutoApplies += subRemaining.freeAutoApplies
      }

      totalRemaining.monthlyCredits += totalRemaining.extraCredits

      if (selectedSub) {
        const { planSnapshot, usage, isTrialPeriod } = selectedSub

        const effectiveMonthlyCredits = isTrialPeriod
          ? 60
          : planSnapshot.monthlyCredits
        const effectivePlanName = isTrialPeriod
          ? `${planSnapshot.name} Trial Period`
          : planSnapshot.name

        const remaining = {
          jobApplicationsToday: Math.max(
            0,
            planSnapshot.dailyLimit - usage.jobApplicationsToday
          ),
          monthlyCredits: Math.max(
            0,
            effectiveMonthlyCredits - usage.monthlyCreditsUsed
          ),
          resumeProfiles: Math.max(
            0,
            planSnapshot.resumeProfiles - usage.resumeProfilesUsed
          ),
          freeTailoredResumes: Math.max(
            0,
            planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
          ),
          freeAutoApplies: Math.max(
            0,
            planSnapshot.freeAutoApplies - usage.autoAppliesUsed
          )
        }

        dbUser.subscription = {
          planName: effectivePlanName,
          billingCycle: planSnapshot.billingCycle,
          startDate: selectedSub.startDate,
          endDate: selectedSub.endDate,
          dailyLimit: planSnapshot.dailyLimit,
          monthlyCredits: effectiveMonthlyCredits,
          usage,
          remaining,
          cancelAt: selectedSub.cancelAt || null,
          isTrialPeriod: isTrialPeriod || false
        }
      } else {
        dbUser.subscription = null
      }

      dbUser.totalRemaining = totalRemaining

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        result: {
          user: dbUser,
          access_token: {
            accessToken: access_token
          }
        }
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Login failed",
        error: error.message,
        success: false
      })
    }
  },

  forgotPassword: async (req, res) => {
    try {
      let email = req.body.email

      let findUser = await User.findOne({ email: email })

      if (!findUser) {
        return res.status(404).json({
          msg: "User with this Email does not exist",
          success: true
        })
      }

      const resetPasswordOtp = Math.floor(100000 + Math.random() * 900000)

      let updateUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { resetPasswordOtp: resetPasswordOtp } },
        { new: true }
      )
      // services.sendResetPasswordMail(findUser.email, resetPasswordOtp)
      services.sendResetPasswordMailBrevo(findUser.email, resetPasswordOtp)

      return res.status(200).json({
        msg: "Reset Email Have been sent",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
        success: false
      })
    }
  },

  verifyResetPasswordOtp: async (req, res) => {
    const { resetPasswordOtp } = req.body
    try {
      const user = await User.findOne({ resetPasswordOtp: resetPasswordOtp })
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid otp"
        })
      }
      user.resetPasswordStatus = true
      await user.save()

      return res.status(200).json({
        success: true,
        message: "Reset Password otp verified successfully"
      })
    } catch (error) {
      return res.status(500).json({
        success: fasle,
        message: "Server error",
        error
      })
    }
  },

  resetPassword: async (req, res) => {
    try {
      let resetPasswordOtp = req.body.resetPasswordOtp
      let findUser = await User.findOne({
        resetPasswordOtp: resetPasswordOtp,
        resetPasswordStatus: true
      })

      if (!findUser) {
        return res.status(200).json({
          msg: "Invalid OTP or OTP not Verified",
          success: true
        })
      }

      let password = req.body.password
      let match = await utils.comparePassword(password, findUser.password)
      if (match) {
        return res.status(400).json({
          msg: "Old password cannot be set as new password",
          success: false
        })
      }
      let newPassword = await bcrypt.hash(password, 10)

      let user = await User.findByIdAndUpdate(
        { _id: findUser._id },
        {
          $set: {
            password: newPassword,
            resetPasswordOtp: "",
            resetPasswordStatus: false
          }
        },
        { new: true }
      )
      return res.status(200).json({
        msg: "User Password Have been Reset",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
        success: false
      })
    }
  },

  changePassword: async (req, res) => {
    try {
      let _id = req.token._id
      let data = req.body
      let password = data.password

      let user = await User.findOne({ _id })

      if (!user) {
        return res.status(404).json({
          msg: "User not found with this id",
          success: false
        })
      }
      let userId = user._id

      let match = await utils.comparePassword(password, user.password)

      if (!match) {
        return res.status(400).json({
          msg: "The password you entered does not match your real password! Input Correct Password",
          success: false
        })
      }

      data.password = await bcrypt.hash(data.newPassword, 10)

      let samePassword = await utils.comparePassword(
        data.newPassword,
        user.password
      )
      if (samePassword) {
        return res.status(400).json({
          msg: "Old and new password cannot be same",
          success: false
        })
      }

      let updatePassword = await User.findOneAndUpdate(
        { _id: userId },
        {
          password: data.password
        }
      )

      return res.status(200).json({
        msg: "Password Updated",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to Change Password",
        error: error.message,
        success: false
      })
    }
  },

  //FILE URL
  fileUploadS3: async (req, res, next) => {
    try {
      let files = Array.isArray(req.files.files)
        ? req.files.files
        : [req.files.files]

      let uploadResults = []

      // Loop through each file and upload it to S3
      for (let file of files) {
        // Determine file type based on mimetype
        let typeFile
        if (file.mimetype.includes("audio")) {
          typeFile = "Audio"
        } else if (
          file.mimetype.includes("application") &&
          !file.mimetype.includes("rar") &&
          !file.mimetype.includes("zip")
        ) {
          typeFile = "Document"
        } else if (file.mimetype.includes("image")) {
          typeFile = "Image"
        } else if (file.mimetype.includes("video")) {
          typeFile = "Video"
        }

        const accessType = req.body.type === "Private" ? "Private" : "Public"
        const fileLocation = await utils.uploadFile(file, accessType)

        const url = fileLocation.Location
        let urlNew = url
        let urlPath = url

        if (process.env.CDN_URL) {
          urlNew = url.replace(process.env.S3_URL, process.env.CDN_URL)
          urlNew = urlNew.replace(process.env.S3_URL2, process.env.CDN_URL)
          urlPath = urlNew?.replace(process.env.CDN_URL, "")
        } else {
          urlPath = urlNew.replace(process.env.S3_URL, "")
        }

        // Collect the upload result for each file
        uploadResults.push({
          fileLocation: fileLocation.Location,
          urlCDN: urlNew,
          urlPath: urlPath
        })
      }

      // Returning the array of uploaded file locations
      return res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        files: uploadResults
      })
    } catch (error) {
      console.error("Error handling file upload:", error)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  },

  downloadFileFromS3: async (req, res) => {
    try {
      const fileUrl = req.query.url

      if (!fileUrl) {
        return res.status(400).json({
          success: false,
          message: "Missing file URL"
        })
      }

      // ✅ Your bucket URL
      const bucketUrl = "https://poweredjob-bucket.s3.amazonaws.com/"
      const bucketName = "poweredjob-bucket"

      // ✅ Extract S3 key from full URL
      const s3Key = fileUrl.replace(bucketUrl, "")

      // 🧠 Get metadata to determine content-type
      const headParams = {
        Bucket: bucketName,
        Key: s3Key
      }

      const headData = await s3.headObject(headParams).promise()

      // ✅ Set download headers
      res.setHeader("Content-Type", headData.ContentType)
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(s3Key)}"`
      )

      // ✅ Stream file from S3 to response
      const stream = s3.getObject(headParams).createReadStream()
      stream.pipe(res)
    } catch (error) {
      console.error("Error downloading file from S3:", error)
      return res.status(500).json({
        success: false,
        message: "Failed to download file"
      })
    }
  },

  saveJob: async (req, res) => {
    try {
      let data = req.body
      let userId = req.token._id
      data.userId = req.token._id

      // Validate required fields
      if (
        !data ||
        !data.companyName ||
        !data.jobTitle ||
        !data.jobDate ||
        !data.platformName ||
        !data.processingLink ||
        !data.selectedProfile
      ) {
        return res.status(400).json({
          msg: "Please provide valid job application data (userId, companyName, jobTitle, jobDate, platformName, processingLink, and selectedProfile are required)",
          success: false
        })
      }

      // Check if the user exists
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          msg: "User not found",
          success: false
        })
      }

      // Check if the job application with the same processingLink already exists
      const existingJob = await userJobApplicationHistoryModel.findOne({
        processingLink: data.processingLink,
        platformName: data.platformName
      })
      if (existingJob) {
        return res.status(400).json({
          msg: "This job application has already been saved.",
          success: false
        })
      }

      console.log("DATA", data)

      // Create and save job application record
      const jobApplication = new userJobApplicationHistoryModel(data)
      const saveJob = await jobApplication.save()

      if (!saveJob) {
        return res.status(500).json({
          msg: "Failed to save job application",
          success: false
        })
      }

      return res.status(200).json({
        jobApplication: saveJob,
        msg: "Job application saved successfully",
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to save job application",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  getJobApplications: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query
      const userId = req.token._id // Use the userId from the token

      if (!userId) {
        return res.status(400).json({
          msg: "Please provide a valid userId",
          success: false
        })
      }

      // Convert page and limit to integers
      const pageNumber = parseInt(page)
      const limitNumber = parseInt(limit)

      // Calculate the offset for pagination
      const offset = (pageNumber - 1) * limitNumber

      // Fetch the user job applications with pagination and populate userId and selectedProfile
      const jobApplications = await userJobApplicationHistoryModel
        .find({ userId }) // Ensure it matches the userId from the token
        .skip(offset)
        .limit(limitNumber)
        .sort({ jobDate: -1 }) // Sort by jobDate in descending order
        .populate("userId", "name email") // Populate userId with name and email (adjust as per required fields)
        .populate("selectedProfile", "resumeName") // Populate selectedProfile with name and email (adjust as per required fields)

      // Get the total count of job applications for the user
      const totalCount = await userJobApplicationHistoryModel.countDocuments({
        userId
      })

      return res.status(200).json({
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        jobApplications,
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        msg: "Failed to fetch job applications",
        error: error.message || "Something went wrong.",
        success: false
      })
    }
  },

  // getUserJobApplicationsByDate: async (req, res) => {
  //   try {
  //     const { date } = req.query;
  //     let userId = req.token._id;

  //     if (!userId) {
  //       return res.status(400).json({ success: false, message: "userId is required" });
  //     }

  //     const matchQuery = {
  //       userId: new mongoose.Types.ObjectId(userId),
  //       deleted: false,
  //     };

  //     if (date) {
  //       const start = new Date(date);
  //       start.setHours(0, 0, 0, 0);
  //       const end = new Date(start);
  //       end.setDate(end.getDate() + 1);
  //       matchQuery.jobDate = { $gte: start, $lt: end };
  //     }

  //     const results = await userJobApplicationHistoryModel.aggregate([
  //       { $mat ch: matchQuery },

  //       {
  //         $group: {
  //           _id: {
  //             platformName: "$platformName",
  //             selectedProfile: "$selectedProfile",
  //             userId: "$userId",
  //             skillSearchKeyword: "$skillSearchKeyword",
  //           },
  //           totalNoOfAppliedJobs: { $sum: 1 },
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: "resumes",
  //           localField: "_id.selectedProfile",
  //           foreignField: "_id",
  //           as: "resume",
  //         },
  //       },
  //       { $unwind: "$resume" },

  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "_id.userId",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       { $unwind: "$user" },

  //       {
  //         $project: {
  //           platformName: "$_id.platformName",
  //           totalNoOfAppliedJobs: 1,
  //           resumeChosen: "$resume.resumeName",  // Replaced selectedProfile with resumeName
  //           skillSearch: "$_id.skillSearchKeyword",
  //           userAccount: "$user.email",
  //         },
  //       },

  //       // Optional: Remove _id field if you don’t want it in the final response
  //       {
  //         $project: {
  //           _id: 0, // Remove _id field
  //           platformName: 1,
  //           totalNoOfAppliedJobs: 1,
  //           resumeChosen: 1,
  //           skillSearch: 1,
  //           userAccount: 1,
  //         },
  //       }
  //     ]);

  //     return res.status(200).json({ success: true, data: results });
  //   } catch (error) {
  //     console.error("Error fetching job applications:", error);
  //     return res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },

  // getUserJobApplicationsByDate: async (req, res) => {
  //   try {
  //     const { date } = req.query;
  //     let userId = req.token._id;

  //     if (!userId) {
  //       return res.status(400).json({ success: false, message: "userId is required" });
  //     }

  //     const matchQuery = {
  //       userId: new mongoose.Types.ObjectId(userId),
  //       deleted: false,
  //     };

  //     if (date) {
  //       const start = new Date(date);
  //       start.setHours(0, 0, 0, 0);
  //       const end = new Date(start);
  //       end.setDate(end.getDate() + 1);
  //       matchQuery.jobDate = { $gte: start, $lt: end };
  //     }

  //     const results = await userJobApplicationHistoryModel.aggregate([
  //       { $match: matchQuery },

  //       {
  //         $group: {
  //           _id: {
  //             platformName: "$platformName",
  //             selectedProfile: "$selectedProfile",
  //             userId: "$userId",
  //             skillSearchKeyword: "$skillSearchKeyword",
  //           },
  //           totalNoOfAppliedJobs: { $sum: 1 },
  //         },
  //       },

  //       {
  //         $lookup: {
  //           from: "resumes",
  //           localField: "_id.selectedProfile",
  //           foreignField: "_id",
  //           as: "resume",
  //         },
  //       },
  //       { $unwind: "$resume" },

  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "_id.userId",
  //           foreignField: "_id",
  //           as: "user",
  //         },
  //       },
  //       { $unwind: "$user" },

  //       {
  //         $project: {
  //           platformName: "$_id.platformName",
  //           totalNoOfAppliedJobs: 1,
  //           resumeChosen: "$resume.resumeName",  // Replacing selectedProfile with resumeName
  //           resumeId: "$_id.selectedProfile",   // Adding selectedProfile as resumeId
  //           skillSearch: "$_id.skillSearchKeyword",
  //           userAccount: "$user.email",
  //         },
  //       },

  //       {
  //         $project: {
  //           _id: 0,
  //           platformName: 1,
  //           totalNoOfAppliedJobs: 1,
  //           resumeChosen: 1,
  //           resumeId: 1,
  //           skillSearch: 1,
  //           userAccount: 1,
  //         },
  //       }
  //     ]);

  //     return res.status(200).json({ success: true, data: results });
  //   } catch (error) {
  //     console.error("Error fetching job applications:", error);
  //     return res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },

  getUserJobApplicationsByDate: async (req, res) => {
    try {
      const { date } = req.query
      let userId = req.token._id

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "userId is required" })
      }

      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        deleted: false
      }

      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        matchQuery.jobDate = { $gte: start, $lt: end }
      }

      const results = await userJobApplicationHistoryModel.aggregate([
        { $match: matchQuery },

        {
          $group: {
            _id: {
              platformName: "$platformName",
              selectedProfile: "$selectedProfile",
              userId: "$userId",
              skillSearchKeyword: "$skillSearchKeyword",
              jobDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$jobDate" }
              }
            },
            totalNoOfAppliedJobs: { $sum: 1 }
          }
        },

        {
          $lookup: {
            from: "resumes",
            localField: "_id.selectedProfile",
            foreignField: "_id",
            as: "resume"
          }
        },
        { $unwind: "$resume" },

        {
          $lookup: {
            from: "users",
            localField: "_id.userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },

        {
          $project: {
            platformName: "$_id.platformName",
            totalNoOfAppliedJobs: 1,
            resumeChosen: "$resume.resumeName", // Replacing selectedProfile with resumeName
            resumeId: "$_id.selectedProfile", // Adding selectedProfile as resumeId
            skillSearch: "$_id.skillSearchKeyword",
            userAccount: "$user.email",
            jobDate: "$_id.jobDate" // Adding the jobDate field
          }
        },

        {
          $project: {
            _id: 0,
            platformName: 1,
            totalNoOfAppliedJobs: 1,
            resumeChosen: 1,
            resumeId: 1,
            skillSearch: 1,
            userAccount: 1,
            jobDate: 1 // Including the jobDate in the final projection
          }
        }
      ])

      return res.status(200).json({ success: true, data: results })
    } catch (error) {
      console.error("Error fetching job applications:", error)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  },

  getUserJobApplicationsByPlatform: async (req, res) => {
    try {
      let userId = req.token._id

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "userId is required" })
      }

      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        deleted: false // Filter out deleted job applications
      }

      // Pagination setup
      const limit = 20
      const page = parseInt(req.query.page) || 1 // Default to page 1 if not provided
      const skip = (page - 1) * limit

      const results = await userJobApplicationHistoryModel.aggregate([
        { $match: matchQuery }, // Match the userId and deleted status

        // Group by platformName and userId to get the count of applied jobs for each group
        {
          $group: {
            _id: {
              platformName: "$platformName",
              userId: "$userId" // Group by userId
            },
            totalNoOfAppliedJobs: { $sum: 1 } // Count the total number of applied jobs for each group
          }
        },

        // Lookup user data to get the user's email
        {
          $lookup: {
            from: "users",
            localField: "_id.userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" }, // Unwind the user array to get user details

        // Project the fields to be returned in the final response
        {
          $project: {
            platformName: "$_id.platformName", // Platform name
            totalNoOfAppliedJobs: 1, // Total number of applied jobs
            userAccount: "$user.email" // User email
          }
        },

        { $skip: skip }, // Apply pagination
        { $limit: limit }, // Limit the number of results to 20 per page

        // Optional: Remove _id field if you don’t want it in the final response
        {
          $project: {
            _id: 0, // Remove _id field
            platformName: 1,
            totalNoOfAppliedJobs: 1,
            userAccount: 1
          }
        }
      ])

      return res.status(200).json({ success: true, data: results })
    } catch (error) {
      console.error("Error fetching job applications:", error)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  },

  // getUserJobApplicationsByFilters: async (req, res) => {
  //   try {
  //     const { platformName, selectedProfile, page = 1 ,date } = req.query;  // Using query params for GET request
  //     let userId = req.token._id;

  //  if (!platformName && selectedProfile) {
  //   return res.status(400).json({ success: false, message: "Platform Name is required" });
  // }

  //     // Pagination setup
  //     const limit = 5000;
  //     const skip = (page - 1) * limit;

  //     const matchQuery = {
  //       userId: new mongoose.Types.ObjectId(userId),
  //       deleted: false,
  //     };

  // if (platformName) {
  //   matchQuery.platformName = platformName;
  // }

  // if (selectedProfile) {
  //   matchQuery.selectedProfile = new mongoose.Types.ObjectId(selectedProfile);
  // }
  //  if (date) {
  //       const start = new Date(date);
  //       start.setHours(0, 0, 0, 0);
  //       const end = new Date(start);
  //       end.setDate(end.getDate() + 1);
  //       matchQuery.jobDate = { $gte: start, $lt: end };
  //     }

  //     const results = await userJobApplicationHistoryModel.aggregate([
  //       { $match: matchQuery }, // Matching based on platformName, selectedProfile, and userId

  //       // Lookup resumes to get the resume name
  //       {
  //         $lookup: {
  //           from: "resumes",
  //           localField: "selectedProfile", // Referencing selectedProfile
  //           foreignField: "_id",  // Matching the _id from resumes collection
  //           as: "resume",
  //         },
  //       },
  //       { $unwind: "$resume" }, // Unwind the resume array

  //       // Lookup users to get the user's email
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "userId",  // Matching userId from the userJobApplicationHistory collection
  //           foreignField: "_id",   // Matching the _id from users collection
  //           as: "user",
  //         },
  //       },
  //       { $unwind: "$user" }, // Unwind the user array

  //       // Project the fields that you want to return
  //       {
  //         $project: {
  //           companyName: 1,
  //           jobTitle: 1,
  //           resumeChosen: "$resume.resumeName",  // Use resumeName from the resume collection
  //           jobDate: 1,
  //           jobLink: "$processingLink",  // Map the field `processingLink` as jobLink
  //           skillSearch: 1,
  //           userAccount: "$user.email",  // Map email of the user
  //         },
  //       },

  //       // Apply pagination by skipping the appropriate number of documents and limiting the result to 20
  //       { $skip: skip },
  //       { $limit: limit },
  //     ]);

  //     return res.status(200).json({ success: true, data: results });
  //   } catch (error) {
  //     console.error("Error fetching job applications:", error);
  //     return res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  getUserJobApplicationsByFilters: async (req, res) => {
    try {
      const {
        platformName,
        selectedProfile,
        page = 1,
        date,
        skillSearchKeyword
      } = req.query // Using query params for GET request
      let userId = req.token._id

      if (!platformName && selectedProfile) {
        return res
          .status(400)
          .json({ success: false, message: "Platform Name is required" })
      }

      // Pagination setup
      const limit = 5000
      const skip = (page - 1) * limit

      const matchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        deleted: false
      }

      // Apply platformName filter if provided
      if (platformName) {
        matchQuery.platformName = platformName
      }

      // Apply selectedProfile filter if provided
      if (selectedProfile) {
        matchQuery.selectedProfile = new mongoose.Types.ObjectId(
          selectedProfile
        )
      }

      // Apply date filter if provided
      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        matchQuery.jobDate = { $gte: start, $lt: end }
      }

      // Apply skillSearchKeyword filter if provided
      if (skillSearchKeyword) {
        matchQuery.skillSearchKeyword = new RegExp(skillSearchKeyword, "i") // Using regex for case-insensitive search
      }

      const results = await userJobApplicationHistoryModel.aggregate([
        { $match: matchQuery }, // Matching based on platformName, selectedProfile, userId, and skillSearchKeyword

        // Lookup resumes to get the resume name
        {
          $lookup: {
            from: "resumes",
            localField: "selectedProfile", // Referencing selectedProfile
            foreignField: "_id", // Matching the _id from resumes collection
            as: "resume"
          }
        },
        { $unwind: "$resume" }, // Unwind the resume array

        // Lookup users to get the user's email
        {
          $lookup: {
            from: "users",
            localField: "userId", // Matching userId from the userJobApplicationHistory collection
            foreignField: "_id", // Matching the _id from users collection
            as: "user"
          }
        },
        { $unwind: "$user" }, // Unwind the user array

        // Project the fields that you want to return
        {
          $project: {
            companyName: 1,
            jobTitle: 1,
            resumeChosen: "$resume.resumeName", // Use resumeName from the resume collection
            jobDate: 1,
            jobLink: "$processingLink", // Map the field `processingLink` as jobLink
            skillSearch: 1,
            userAccount: "$user.email" // Map email of the user
          }
        },

        // Apply pagination by skipping the appropriate number of documents and limiting the result to 5000
        { $skip: skip },
        { $limit: limit }
      ])

      return res.status(200).json({ success: true, data: results })
    } catch (error) {
      console.error("Error fetching job applications:", error)
      return res.status(500).json({ success: false, message: "Server error" })
    }
  },

  //  getUserSubscriptionUsage: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const userSub = await UserSubscription.findOne({
  //       userId,
  //       isActive: true,
  //     }).lean();

  //     if (!userSub) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found",
  //       });
  //     }

  //     const { planSnapshot, usage } = userSub;

  //     const remaining = {
  //       jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //       monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //       resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //       tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //       autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //     };

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes,
  //     };

  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: userSub.startDate,
  //         endDate: userSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features,
  //       },
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message,
  //     });
  //   }
  // },

  // getUserSubscriptionUsage: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     // Fetch user and their active subscription
  //     const [user, userSub] = await Promise.all([
  //       User.findById(userId).lean(),
  //       UserSubscription.findOne({ userId, isActive: true }).lean(),
  //     ]);

  //     if (!userSub) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found",
  //       });
  //     }

  //     const { planSnapshot, usage } = userSub;

  //     const remaining = {
  //       jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //       monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //       extraCredits: user?.credits || 0,
  //       resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //       tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //       autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //     };

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes,
  //     };

  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: userSub.startDate,
  //         endDate: userSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features,
  //       },
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message,
  //     });
  //   }
  // },

  //TEMP
  // getUserSubscriptionUsage: async (req, res) => {
  //   try {
  //     const userId = req.token._id

  //     // Fetch user and their active subscription
  //     const [user, userSub] = await Promise.all([
  //       User.findById(userId).lean(),
  //       UserSubscription.findOne({ userId, isActive: true }).lean()
  //     ])

  //     if (!userSub) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found"
  //       })
  //     }

  //     const matchQuery = {
  //       userId: new mongoose.Types.ObjectId(userId)
  //     }

  //     const start = new Date()
  //     start.setHours(0, 0, 0, 0)
  //     const end = new Date(start)
  //     end.setDate(end.getDate() + 1)
  //     matchQuery.createdAt = { $gte: start, $lt: end }

  //     const jobActivities = await JobsActivity.aggregate([
  //       { $match: matchQuery },
  //       {
  //         $group: {
  //           _id: {
  //             userId: "$userId"
  //           },
  //           resumeId: { $first: "$resumeId" },
  //           platformName: { $first: "$platform" },
  //           totalNoOfAppliedJobs: { $sum: 1 }
  //         }
  //       }
  //     ])

  //     const { planSnapshot, usage } = userSub
  //     const extraCredits = user?.credits || 0
  //     usage.autoAppliesUsed = jobActivities[0]?.totalNoOfAppliedJobs || 0

  //     const remaining = {
  //       jobApplicationsToday: Math.max(
  //         0,
  //         planSnapshot.dailyLimit - usage.jobApplicationsToday
  //       ),
  //       // monthlyCredits:
  //       //   Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed) +
  //       //   extraCredits, // ✅ Combined
  //             monthlyCredits:
  //         Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //       extraCredits, // ✅ Returned separately
  //       resumeProfiles: Math.max(
  //         0,
  //         planSnapshot.resumeProfiles - usage.resumeProfilesUsed
  //       ),
  //       tailoredResumes: Math.max(
  //         0,
  //         planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
  //       ),
  //       autoApplies: Math.max(
  //         0,
  //         planSnapshot.freeAutoApplies - usage.autoAppliesUsed
  //       )
  //     }

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: userSub.startDate,
  //         endDate: userSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features
  //       }
  //     })
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message
  //     })
  //   }
  // },

  //   getUserSubscriptionUsage: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const user = await User.findById(userId).lean();
  //     const userSubs = await UserSubscription.find({ userId, isActive: true }).lean();

  //     if (!user || userSubs.length === 0) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found",
  //       });
  //     }

  //     // Get today's job activity for autoApplies
  //     const start = new Date();
  //     start.setHours(0, 0, 0, 0);
  //     const end = new Date(start);
  //     end.setDate(end.getDate() + 1);

  //     const jobActivities = await JobsActivity.aggregate([
  //       {
  //         $match: {
  //           userId: new mongoose.Types.ObjectId(userId),
  //           createdAt: { $gte: start, $lt: end },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$userId",
  //           totalNoOfAppliedJobs: { $sum: 1 },
  //         },
  //       },
  //     ]);

  //     const todayAutoApplies = jobActivities[0]?.totalNoOfAppliedJobs || 0;
  //     const extraCredits = user.credits || 0;

  //     // Track total values across subscriptions
  //     const totalRemaining = {
  //       jobApplicationsToday: 0,
  //       monthlyCredits: 0,
  //       resumeProfiles: 0,
  //       tailoredResumes: 0,
  //       autoApplies: 0,
  //       extraCredits,
  //     };

  //     const subscriptions = [];

  //     for (const userSub of userSubs) {
  //       const { planSnapshot, usage } = userSub;

  //       // Override today's auto applies
  //       usage.autoAppliesUsed = todayAutoApplies;

  //       const subRemaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       // Sum into totals
  //       totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday;
  //       totalRemaining.monthlyCredits += subRemaining.monthlyCredits;
  //       totalRemaining.resumeProfiles += subRemaining.resumeProfiles;
  //       totalRemaining.tailoredResumes += subRemaining.tailoredResumes;
  //       totalRemaining.autoApplies += subRemaining.autoApplies;

  //       subscriptions.push({
  //         planName: planSnapshot.name,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: userSub.startDate,
  //         endDate: userSub.endDate,
  //         usage,
  //         remaining: subRemaining,
  //         features: {
  //           includesAutoApply: planSnapshot.includesAutoApply,
  //           includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //           includesResumeScore: planSnapshot.includesResumeScore,
  //           includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //           includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //           includesTailoredResumes: planSnapshot.includesTailoredResumes,
  //         },
  //         cancelAt: userSub.cancelAt || null,
  //       });
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       subscriptions,
  //       totalRemaining,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message,
  //     });
  //   }
  // },

  // getUserSubscriptionUsage: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const user = await User.findById(userId).lean();
  //     const userSubs = await UserSubscription.find({ userId, isActive: true }).lean();

  //     if (!user || userSubs.length === 0) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found",
  //       });
  //     }

  //     // Get today's job activity for autoApplies
  //     const start = new Date();
  //     start.setHours(0, 0, 0, 0);
  //     const end = new Date(start);
  //     end.setDate(end.getDate() + 1);

  //     const jobActivities = await JobsActivity.aggregate([
  //       {
  //         $match: {
  //           userId: new mongoose.Types.ObjectId(userId),
  //           createdAt: { $gte: start, $lt: end },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$userId",
  //           totalNoOfAppliedJobs: { $sum: 1 },
  //         },
  //       },
  //     ]);

  //     const todayAutoApplies = jobActivities[0]?.totalNoOfAppliedJobs || 0;
  //     const extraCredits = user.credits || 0;

  //     // Track total values across all active subscriptions
  //     const totalRemaining = {
  //       jobApplicationsToday: 0,
  //       monthlyCredits: 0,
  //       resumeProfiles: 0,
  //       tailoredResumes: 0,
  //       autoApplies: 0,
  //       extraCredits,
  //     };

  //     let selectedSubscription = null;

  //     for (const userSub of userSubs) {
  //       const { planSnapshot, usage, isCancelled } = userSub;

  //       // Override today's auto applies
  //       usage.autoAppliesUsed = todayAutoApplies;

  //       const subRemaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       // Sum into totals
  //       totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday;
  //       totalRemaining.monthlyCredits += subRemaining.monthlyCredits;
  //       totalRemaining.resumeProfiles += subRemaining.resumeProfiles;
  //       totalRemaining.tailoredResumes += subRemaining.tailoredResumes;
  //       totalRemaining.autoApplies += subRemaining.autoApplies;

  //       // Pick only one active + not cancelled subscription for `subscriptions` object
  //       if (!isCancelled && !selectedSubscription) {
  //         selectedSubscription = {
  //           planName: planSnapshot.name,
  //           billingCycle: planSnapshot.billingCycle,
  //           startDate: userSub.startDate,
  //           endDate: userSub.endDate,
  //           usage,
  //           remaining: subRemaining,
  //           features: {
  //             includesAutoApply: planSnapshot.includesAutoApply,
  //             includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //             includesResumeScore: planSnapshot.includesResumeScore,
  //             includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //             includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //             includesTailoredResumes: planSnapshot.includesTailoredResumes,
  //           },
  //           cancelAt: userSub.cancelAt || null,
  //         };
  //       }
  //     }

  //     totalRemaining.monthlyCredits += totalRemaining.extraCredits;

  //     return res.status(200).json({
  //       success: true,
  //       subscription: selectedSubscription,
  //       totalRemaining,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message,
  //     });
  //   }
  // },

  // getUserSubscriptionUsage: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const user = await User.findById(userId).lean();
  //     const userSubs = await UserSubscription.find({ userId, isActive: true }).lean();

  //     if (!user || userSubs.length === 0) {
  //       return res.status(200).json({
  //         success: true,
  //         msg: "No active subscription found",
  //       });
  //     }

  //     // Get today's job activity
  //     const start = new Date();
  //     start.setHours(0, 0, 0, 0);
  //     const end = new Date(start);
  //     end.setDate(end.getDate() + 1);

  //     const jobActivities = await JobsActivity.aggregate([
  //       {
  //         $match: {
  //           userId: new mongoose.Types.ObjectId(userId),
  //           createdAt: { $gte: start, $lt: end },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$userId",
  //           totalNoOfAppliedJobs: { $sum: 1 },
  //         },
  //       },
  //     ]);

  //     const todayAutoApplies = jobActivities[0]?.totalNoOfAppliedJobs || 0;
  //     const extraCredits = user.credits || 0;

  //     const totalRemaining = {
  //       jobApplicationsToday: 0,
  //       monthlyCredits: 0,
  //       resumeProfiles: 0,
  //       tailoredResumes: 0,
  //       autoApplies: 0,
  //       extraCredits,
  //     };

  //     // Select best subscription
  //     let selectedSub = null;

  //     if (userSubs.length === 1) {
  //       selectedSub = userSubs[0];
  //     } else {
  //       const preferred = userSubs.find(
  //         sub => sub.planSnapshot?.identifier !== 'free_plan' && sub.isCancelled === false
  //       );
  //       selectedSub = preferred || userSubs[0];
  //     }

  //     // Loop for total calculations
  //     for (const sub of userSubs) {
  //       const { planSnapshot, usage } = sub;

  //       usage.autoAppliesUsed = todayAutoApplies;

  //       const subRemaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday;
  //       totalRemaining.monthlyCredits += subRemaining.monthlyCredits;
  //       totalRemaining.resumeProfiles += subRemaining.resumeProfiles;
  //       totalRemaining.tailoredResumes += subRemaining.tailoredResumes;
  //       totalRemaining.autoApplies += subRemaining.autoApplies;
  //     }

  //     totalRemaining.monthlyCredits += totalRemaining.extraCredits;

  //     // Prepare selected subscription object
  //     let selectedSubscription = null;
  //     if (selectedSub) {
  //       const { planSnapshot, usage } = selectedSub;

  //       usage.autoAppliesUsed = todayAutoApplies;

  //       const remaining = {
  //         jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //         monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed),
  //         resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //         tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //         autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed),
  //       };

  //       selectedSubscription = {
  //         planName: planSnapshot.name,
  //         planIdentifier: planSnapshot.identifier,
  //         dailyLimit:planSnapshot.dailyLimit,
  //         billingCycle: planSnapshot.billingCycle,
  //         startDate: selectedSub.startDate,
  //         endDate: selectedSub.endDate,
  //         usage,
  //         remaining,
  //         features: {
  //           includesAutoApply: planSnapshot.includesAutoApply,
  //           includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //           includesResumeScore: planSnapshot.includesResumeScore,
  //           includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //           includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //           includesTailoredResumes: planSnapshot.includesTailoredResumes,
  //         },
  //         cancelAt: selectedSub.cancelAt || null,
  //         isCancelled: selectedSub.isCancelled || null,

  //       };
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       subscription: selectedSubscription,
  //       totalRemaining,
  //     });

  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message,
  //     });
  //   }
  // },

  getUserSubscriptionUsage: async (req, res) => {
    try {
      const userId = req.token._id

      const user = await User.findById(userId).lean()
      const userSubs = await UserSubscription.find({
        userId,
        isActive: true
      }).lean()

      if (!user || userSubs.length === 0) {
        return res.status(200).json({
          success: true,
          msg: "No active subscription found"
        })
      }

      // Get today's job activity
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)

      const jobActivities = await JobsActivity.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: start, $lt: end }
          }
        },
        {
          $group: {
            _id: "$userId",
            totalNoOfAppliedJobs: { $sum: 1 }
          }
        }
      ])

      const todayAutoApplies = jobActivities[0]?.totalNoOfAppliedJobs || 0
      const extraCredits = user.credits || 0

      const totalRemaining = {
        jobApplicationsToday: 0,
        monthlyCredits: 0,
        resumeProfiles: 0,
        tailoredResumes: 0,
        autoApplies: 0,
        extraCredits
      }

      // Select best subscription
      let selectedSub = null

      if (userSubs.length === 1) {
        selectedSub = userSubs[0]
      } else {
        const preferred = userSubs.find(
          (sub) =>
            sub.planSnapshot?.identifier !== "free_plan" &&
            sub.isCancelled === false
        )
        selectedSub = preferred || userSubs[0]
      }

      // Loop for total calculations
      for (const sub of userSubs) {
        const { planSnapshot, usage, isTrialPeriod } = sub

        usage.autoAppliesUsed = todayAutoApplies

        const effectiveMonthlyCredits = isTrialPeriod
          ? 60
          : planSnapshot.monthlyCredits

        const subRemaining = {
          jobApplicationsToday: Math.max(
            0,
            planSnapshot.dailyLimit - usage.jobApplicationsToday
          ),
          monthlyCredits: Math.max(
            0,
            effectiveMonthlyCredits - usage.monthlyCreditsUsed
          ),
          resumeProfiles: Math.max(
            0,
            planSnapshot.resumeProfiles - usage.resumeProfilesUsed
          ),
          tailoredResumes: Math.max(
            0,
            planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
          ),
          autoApplies: Math.max(
            0,
            planSnapshot.freeAutoApplies - usage.autoAppliesUsed
          )
        }

        totalRemaining.jobApplicationsToday += subRemaining.jobApplicationsToday
        totalRemaining.monthlyCredits += subRemaining.monthlyCredits
        totalRemaining.resumeProfiles += subRemaining.resumeProfiles
        totalRemaining.tailoredResumes += subRemaining.tailoredResumes
        totalRemaining.autoApplies += subRemaining.autoApplies
      }

      // Add user's extra credits to monthly credits
      totalRemaining.monthlyCredits += extraCredits

      // Prepare selected subscription object
      let selectedSubscription = null
    
      if (selectedSub) {
        const { planSnapshot, usage, isTrialPeriod } = selectedSub

        usage.autoAppliesUsed = todayAutoApplies

        const effectiveMonthlyCredits = isTrialPeriod
          ? 60
          : planSnapshot.monthlyCredits
        const effectivePlanName = isTrialPeriod
          ? `${planSnapshot.name} Trial Period`
          : planSnapshot.name

        const remaining = {
          jobApplicationsToday: Math.max(
            0,
            planSnapshot.dailyLimit - usage.jobApplicationsToday
          ),
          monthlyCredits:
            Math.max(0, effectiveMonthlyCredits - usage.monthlyCreditsUsed) +
            extraCredits,
          resumeProfiles: Math.max(
            0,
            planSnapshot.resumeProfiles - usage.resumeProfilesUsed
          ),
          tailoredResumes: Math.max(
            0,
            planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
          ),
          autoApplies: Math.max(
            0,
            planSnapshot.freeAutoApplies - usage.autoAppliesUsed
          )
        }

        selectedSubscription = {
          planName: effectivePlanName,
          monthlyCredits: effectiveMonthlyCredits + extraCredits,
          planIdentifier: planSnapshot.identifier,
          dailyLimit: planSnapshot.dailyLimit,
          billingCycle: planSnapshot.billingCycle,
          startDate: selectedSub.startDate,
          endDate: selectedSub.endDate,
          usage,
          remaining,
          features: {
            includesAutoApply: planSnapshot.includesAutoApply,
            includesResumeBuilder: planSnapshot.includesResumeBuilder,
            includesResumeScore: planSnapshot.includesResumeScore,
            includesAICoverLetters: planSnapshot.includesAICoverLetters,
            includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
            includesTailoredResumes: planSnapshot.includesTailoredResumes
          },
          cancelAt: selectedSub.cancelAt || null,
          isCancelled: selectedSub.isCancelled || null,
          isTrialPeriod: isTrialPeriod || false
        }
      }

      return res.status(200).json({
        success: true,
        subscription: selectedSubscription,
        totalRemaining,
        discountUsed: user.discountUsed || false
      })
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: "Error fetching subscription usage",
        error: err.message
      })
    }
  },

  // userAccountBilling: async (req, res) => {
  //   try {
  //     const userId = req.token._id

  //     const [user, userSub] = await Promise.all([
  //       User.findById(userId).lean(),
  //       UserSubscription.findOne({ userId, isActive: true }).lean()
  //     ])

  //     if (!userSub) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found"
  //       })
  //     }

  //     const { planSnapshot, usage, startDate } = userSub
  //     const extraCredits = user?.credits || 0

  //     const remaining = {
  //       jobApplicationsToday: Math.max(
  //         0,
  //         planSnapshot.dailyLimit - usage.jobApplicationsToday
  //       ),
  //       monthlyCredits:
  //         Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed) +
  //         extraCredits,
  //       extraCredits,
  //       resumeProfiles: Math.max(
  //         0,
  //         planSnapshot.resumeProfiles - usage.resumeProfilesUsed
  //       ),
  //       tailoredResumes: Math.max(
  //         0,
  //         planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
  //       ),
  //       autoApplies: Math.max(
  //         0,
  //         planSnapshot.freeAutoApplies - usage.autoAppliesUsed
  //       )
  //     }

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes
  //     }

  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: planSnapshot.name,
  //         planPrice: planSnapshot.price,
  //         billingCycle: planSnapshot.billingCycle,
  //         paymentMethod: "Card",
  //         lastPayment: {
  //           date: startDate,
  //           amount: planSnapshot.price
  //         },
  //         startDate: userSub.startDate,
  //         endDate: userSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features
  //       }
  //     })
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message
  //     })
  //   }
  // },

  //   userAccountBilling: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const [user, userSub] = await Promise.all([
  //       User.findById(userId).lean(),
  //       UserSubscription.findOne({ userId, isActive: true }).lean()
  //     ]);

  //     if (!userSub || !userSub.stripeSubscriptionId) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No active subscription found"
  //       });
  //     }

  //     const { planSnapshot, usage, startDate } = userSub;
  //     const extraCredits = user?.credits || 0;

  //     // 🆕 Stripe fetch
  //     let nextBillingDate = null;
  //     let discountedAmount = null;

  //     try {
  //       console.log("🔍 Fetching Stripe subscription:", userSub.stripeSubscriptionId);

  //       const subscription = await stripe.subscriptions.retrieve(userSub.stripeSubscriptionId);

  //       if (subscription?.current_period_end) {
  //         nextBillingDate = new Date(subscription.current_period_end * 1000);
  //       } else {
  //         console.warn("⚠️ Subscription does not have current_period_end");
  //       }

  //       const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
  //         subscription: subscription.id,
  //         customer: subscription.customer,
  //       });

  //       if (upcomingInvoice?.total !== undefined) {
  //         discountedAmount = upcomingInvoice.total / 100;
  //       } else {
  //         console.warn("⚠️ No upcoming invoice total found.");
  //       }

  //     } catch (err) {
  //       console.error("❌ Stripe fetch error:", err);
  //     }

  //     const remaining = {
  //       jobApplicationsToday: Math.max(
  //         0,
  //         planSnapshot.dailyLimit - usage.jobApplicationsToday
  //       ),
  //       monthlyCredits:
  //         Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed) +
  //         extraCredits,
  //       extraCredits,
  //       resumeProfiles: Math.max(
  //         0,
  //         planSnapshot.resumeProfiles - usage.resumeProfilesUsed
  //       ),
  //       tailoredResumes: Math.max(
  //         0,
  //         planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
  //       ),
  //       autoApplies: Math.max(
  //         0,
  //         planSnapshot.freeAutoApplies - usage.autoAppliesUsed
  //       )
  //     };

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes
  //     };

  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: planSnapshot.name,
  //         planPrice: planSnapshot.price,
  //         billingCycle: planSnapshot.billingCycle,
  //         paymentMethod: "Card",
  //         lastPayment: {
  //           date: startDate,
  //           amount: planSnapshot.price
  //         },
  //         startDate: userSub.startDate,
  //         endDate: userSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features,
  //         nextBillingDate,       // 🆕 added dynamic Stripe data
  //         discountedAmount       // 🆕 added dynamic Stripe data
  //       }
  //     });
  //   } catch (err) {
  //     console.error("❌ Error in userAccountBilling:", err);
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message
  //     });
  //   }
  // },

  // userAccountBilling: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const [user, userSubs] = await Promise.all([
  //       User.findById(userId).lean(),
  //       UserSubscription.find({ userId, isActive: true }).lean()
  //     ]);

  //     if (!user || userSubs.length === 0) {
  //       return res.status(200).json({
  //         success: true,
  //         msg: "No active subscription found"
  //       });
  //     }

  //     // Step 1: Select the correct userSub based on detailed logic
  //     let selectedSub = null;

  //     const nonFreeSubs = userSubs.filter(
  //       sub => sub.planSnapshot?.identifier !== 'free_plan'
  //     );

  //     // Case 1: Prefer non-free and not cancelled
  //     selectedSub = nonFreeSubs.find(sub => sub.isCancelled === false);

  //     // Case 2: Fallback to non-free cancelled plan
  //     if (!selectedSub && nonFreeSubs.length > 0) {
  //       selectedSub = nonFreeSubs[0];
  //     }

  //     // Case 3: Fallback to any plan (even free)
  //     if (!selectedSub && userSubs.length > 0) {
  //       selectedSub = userSubs[0];
  //     }

  //     if (!selectedSub || !selectedSub.stripeSubscriptionId) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No valid subscription found"
  //       });
  //     }

  //     const { planSnapshot, usage, startDate } = selectedSub;
  //     const extraCredits = user?.credits || 0;

  //     // Get last payment data
  //     let lastPayment = {
  //       date: startDate,
  //       amount: planSnapshot.price
  //     };

  //     // Try to get last payment from PaymentHistory model first
  //     // const lastPaymentRecord = await PaymentHistory.findOne({
  //     //   userId,
  //     //   // stripeSubscriptionId: selectedSub.stripeSubscriptionId,
  //     //   status: "paid"
  //     // }).sort({ paidAt: -1 });

  //   //   const lastPaymentRecord = await PaymentHistory.findOne({ userId, status: "paid" })
  //   // .sort({ createdAt: -1 });

  //   // console.log("LAST PAYMENT RECORD", lastPaymentRecord)
  //  let lastPaymentRecord = false;
  //     if (lastPaymentRecord) {
  //       lastPayment = {
  //         date: lastPaymentRecord.paidAt,
  //         amount: lastPaymentRecord.amount / 100, // Convert from cents to dollars
  //         invoiceId: lastPaymentRecord.invoiceId,
  //         paymentMethod: lastPaymentRecord.paymentMethod
  //       };
  //     } else if (user.stripeCustomerId) {
  //       // Fallback to Stripe API if no local payment history

  // try {
  //   const payments = [];

  //   // 1. All paid invoices (includes $0 ones)
  //   const invoices = await stripe.invoices.list({
  //     customer: user.stripeCustomerId,
  //     status: 'paid',
  //     limit: 100
  //   });

  //   invoices.data.forEach(inv => {
  //     payments.push({
  //       date: new Date(inv.created * 1000),
  //       amount: inv.amount_paid / 100, // can be $0
  //       invoiceId: inv.id,
  //       paymentMethod: inv.payment_intent
  //         ? inv.payment_intent.payment_method_types?.[0] || 'unknown'
  //         : 'unknown',
  //       source: 'invoice'
  //     });
  //   });

  //   // 2. All successful charges (includes $0 ones)
  //   const charges = await stripe.charges.list({
  //     customer: user.stripeCustomerId,
  //     limit: 100
  //   });

  //   charges.data
  //     .filter(c => c.paid && c.status === 'succeeded') // keep $0, skip scheduled
  //     .forEach(charge => {
  //       payments.push({
  //         date: new Date(charge.created * 1000),
  //         amount: charge.amount / 100, // can be $0
  //         invoiceId: charge.invoice || charge.id,
  //         paymentMethod: charge.payment_method_details?.type || 'card',
  //         source: 'charge'
  //       });
  //     });

  //   // 3. Deduplicate payments (avoid double counting same invoice/charge)
  //   const uniquePayments = payments.filter(
  //     (p, idx, arr) =>
  //       idx === arr.findIndex(pp => pp.invoiceId === p.invoiceId)
  //   );

  //   // 4. Sort newest first
  //   uniquePayments.sort((a, b) => b.date - a.date);

  //   const lastPayment = uniquePayments[0] || null;

  //   console.log({ lastPayment, allPayments: uniquePayments });
  // } catch (err) {
  //   console.error("❌ Stripe fetch error:", err.message);
  // }

  //     }

  //     // Stripe Billing Info
  //     let nextBillingDate = null;
  //     let discountedAmount = null;

  //     try {
  //       const subscription = await stripe.subscriptions.retrieve(selectedSub.stripeSubscriptionId);

  //       if (subscription?.current_period_end) {
  //         nextBillingDate = new Date(subscription.current_period_end * 1000);
  //       }

  //       const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
  //         subscription: subscription.id,
  //         customer: subscription.customer,
  //       });

  //       if (upcomingInvoice?.total !== undefined) {
  //         discountedAmount = upcomingInvoice.total / 100;
  //       }

  //     } catch (err) {
  //       console.error("❌ Stripe fetch error:", err.message);
  //     }

  //     const remaining = {
  //       jobApplicationsToday: Math.max(0, planSnapshot.dailyLimit - usage.jobApplicationsToday),
  //       monthlyCredits: Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed) + extraCredits,
  //       extraCredits,
  //       resumeProfiles: Math.max(0, planSnapshot.resumeProfiles - usage.resumeProfilesUsed),
  //       tailoredResumes: Math.max(0, planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed),
  //       autoApplies: Math.max(0, planSnapshot.freeAutoApplies - usage.autoAppliesUsed)
  //     };

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes
  //     };

  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: selectedSub.isTrialPeriod ? `${planSnapshot.name} Trial period` : planSnapshot.name,
  //         planPrice: planSnapshot.price,
  //         billingCycle: planSnapshot.billingCycle,
  //         paymentMethod: lastPayment.paymentMethod || "Card",
  //         lastPayment: {
  //           date: lastPayment.date,
  //           amount: lastPayment.amount,
  //           invoiceId: lastPayment.invoiceId
  //         },
  //         startDate: selectedSub.startDate,
  //         endDate: selectedSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features,
  //         nextBillingDate,
  //         discountedAmount,
  //         isCancelled:selectedSub.isCancelled,
  //         cancelAt:selectedSub.cancelAt
  //       }
  //     });

  //   } catch (err) {
  //     console.error("❌ Error in userAccountBilling:", err);
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message
  //     });
  //   }
  // },

  // userAccountBilling: async (req, res) => {
  //   try {
  //     const userId = req.token._id;

  //     const [user, userSubs] = await Promise.all([
  //       User.findById(userId).lean(),
  //       UserSubscription.find({ userId, isActive: true }).lean()
  //     ]);

  //     if (!user || userSubs.length === 0) {
  //       return res.status(200).json({
  //         success: true,
  //         msg: "No active subscription found"
  //       });
  //     }

  //     // Step 1: Select correct subscription
  //     let selectedSub = null;
  //     const nonFreeSubs = userSubs.filter(
  //       sub => sub.planSnapshot?.identifier !== "free_plan"
  //     );

  //     selectedSub = nonFreeSubs.find(sub => sub.isCancelled === false);
  //     if (!selectedSub && nonFreeSubs.length > 0) {
  //       selectedSub = nonFreeSubs[0];
  //     }
  //     if (!selectedSub && userSubs.length > 0) {
  //       selectedSub = userSubs[0];
  //     }

  //     if (!selectedSub || !selectedSub.stripeSubscriptionId) {
  //       return res.status(404).json({
  //         success: false,
  //         msg: "No valid subscription found"
  //       });
  //     }

  //     const { planSnapshot, usage, startDate } = selectedSub;
  //     const extraCredits = user?.credits || 0;

  //     // Step 2: Last payment logic
  //     let lastPayment = {
  //       date: startDate,
  //       amount: planSnapshot.price
  //     };

  //     let lastPaymentRecord = false; // Replace if you use PaymentHistory
  //     if (lastPaymentRecord) {
  //       lastPayment = {
  //         date: lastPaymentRecord.paidAt,
  //         amount: lastPaymentRecord.amount / 100,
  //         invoiceId: lastPaymentRecord.invoiceId,
  //         paymentMethod: lastPaymentRecord.paymentMethod
  //       };
  //     } else if (user.stripeCustomerId) {
  //       try {
  //         const payments = [];

  //         // 1. All paid invoices (includes $0)
  //         const invoices = await stripe.invoices.list({
  //           customer: user.stripeCustomerId,
  //           status: "paid",
  //           limit: 100
  //         });

  //         invoices.data.forEach(inv => {
  //           payments.push({
  //             date: new Date(inv.created * 1000),
  //             amount: inv.amount_paid / 100,
  //             invoiceId: inv.id,
  //             paymentMethod: inv.payment_intent
  //               ? inv.payment_intent.payment_method_types?.[0] || "unknown"
  //               : "unknown",
  //             source: "invoice"
  //           });
  //         });

  //         // 2. All successful charges (includes one-off payments and $0)
  //         const charges = await stripe.charges.list({
  //           customer: user.stripeCustomerId,
  //           limit: 100
  //         });

  //         charges.data
  //           .filter(c => c.paid && c.status === "succeeded")
  //           .forEach(charge => {
  //             payments.push({
  //               date: new Date(charge.created * 1000),
  //               amount: charge.amount / 100,
  //               invoiceId: charge.invoice || charge.id, // charge.id for one-off
  //               paymentMethod: charge.payment_method_details?.type || "card",
  //               source: "charge"
  //             });
  //           });

  //         // 3. Deduplicate by invoiceId + source
  //         const uniquePayments = payments.filter(
  //           (p, idx, arr) =>
  //             idx === arr.findIndex(
  //               pp => pp.invoiceId === p.invoiceId && pp.source === p.source
  //             )
  //         );

  //         // 4. Sort newest first
  //         uniquePayments.sort((a, b) => b.date - a.date);

  //         // ✅ Assign latest to main lastPayment variable
  //         if (uniquePayments.length > 0) {
  //           lastPayment = uniquePayments[0];
  //         }

  //         console.log({ lastPayment, allPayments: uniquePayments });
  //       } catch (err) {
  //         console.error("❌ Stripe fetch error:", err.message);
  //       }
  //     }

  //     // Step 3: Stripe billing info
  //     let nextBillingDate = null;
  //     let discountedAmount = null;

  //     try {
  //       const subscription = await stripe.subscriptions.retrieve(
  //         selectedSub.stripeSubscriptionId
  //       );

  //       if (subscription?.current_period_end) {
  //         nextBillingDate = new Date(subscription.current_period_end * 1000);
  //       }

  //       const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
  //         subscription: subscription.id,
  //         customer: subscription.customer
  //       });

  //       if (upcomingInvoice?.total !== undefined) {
  //         discountedAmount = upcomingInvoice.total / 100;
  //       }
  //     } catch (err) {
  //       console.error("❌ Stripe fetch error:", err.message);
  //     }

  //     // Step 4: Remaining usage
  //     const remaining = {
  //       jobApplicationsToday: Math.max(
  //         0,
  //         planSnapshot.dailyLimit - usage.jobApplicationsToday
  //       ),
  //       monthlyCredits:
  //         Math.max(
  //           0,
  //           planSnapshot.monthlyCredits - usage.monthlyCreditsUsed
  //         ) + extraCredits,
  //       extraCredits,
  //       resumeProfiles: Math.max(
  //         0,
  //         planSnapshot.resumeProfiles - usage.resumeProfilesUsed
  //       ),
  //       tailoredResumes: Math.max(
  //         0,
  //         planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
  //       ),
  //       autoApplies: Math.max(
  //         0,
  //         planSnapshot.freeAutoApplies - usage.autoAppliesUsed
  //       )
  //     };

  //     const features = {
  //       includesAutoApply: planSnapshot.includesAutoApply,
  //       includesResumeBuilder: planSnapshot.includesResumeBuilder,
  //       includesResumeScore: planSnapshot.includesResumeScore,
  //       includesAICoverLetters: planSnapshot.includesAICoverLetters,
  //       includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
  //       includesTailoredResumes: planSnapshot.includesTailoredResumes
  //     };

  //     // Step 5: Response
  //     return res.status(200).json({
  //       success: true,
  //       subscription: {
  //         planName: selectedSub.isTrialPeriod
  //           ? `${planSnapshot.name} Trial period`
  //           : planSnapshot.name,
  //         planPrice: planSnapshot.price,
  //         billingCycle: planSnapshot.billingCycle,
  //         paymentMethod: lastPayment.paymentMethod || "Card",
  //         lastPayment: {
  //           date: lastPayment.date,
  //           amount: lastPayment.amount,
  //           invoiceId: lastPayment.invoiceId
  //         },
  //         startDate: selectedSub.startDate,
  //         endDate: selectedSub.endDate,
  //         dailyLimit: planSnapshot.dailyLimit,
  //         monthlyCredits: planSnapshot.monthlyCredits,
  //         usage,
  //         remaining,
  //         features,
  //         nextBillingDate,
  //         discountedAmount,
  //         isCancelled: selectedSub.isCancelled,
  //         cancelAt: selectedSub.cancelAt
  //       }
  //     });
  //   } catch (err) {
  //     console.error("❌ Error in userAccountBilling:", err);
  //     return res.status(500).json({
  //       success: false,
  //       msg: "Error fetching subscription usage",
  //       error: err.message
  //     });
  //   }
  // },

  userAccountBilling: async (req, res) => {
    try {
      const userId = req.token._id

      const [user, userSubs] = await Promise.all([
        User.findById(userId).lean(),
        UserSubscription.find({ userId, isActive: true }).lean()
      ])

      if (!user || userSubs.length === 0) {
        return res.status(200).json({
          success: true,
          msg: "No active subscription found"
        })
      }

      // Step 1: Select correct subscription
      let selectedSub = null
      const nonFreeSubs = userSubs.filter(
        (sub) => sub.planSnapshot?.identifier !== "free_plan"
      )

      selectedSub = nonFreeSubs.find((sub) => sub.isCancelled === false)
      if (!selectedSub && nonFreeSubs.length > 0) {
        selectedSub = nonFreeSubs[0]
      }
      if (!selectedSub && userSubs.length > 0) {
        selectedSub = userSubs[0]
      }

      if (!selectedSub || !selectedSub.stripeSubscriptionId) {
        return res.status(404).json({
          success: false,
          msg: "No valid subscription found"
        })
      }

      const { planSnapshot, usage, startDate } = selectedSub
      const extraCredits = user?.credits || 0

      // Step 2: Last payment logic
      let lastPayment = {
        date: startDate,
        amount: planSnapshot.price
      }

      let lastPaymentRecord = false // Replace if you use PaymentHistory
      if (lastPaymentRecord) {
        lastPayment = {
          date: lastPaymentRecord.paidAt,
          amount: lastPaymentRecord.amount / 100,
          invoiceId: lastPaymentRecord.invoiceId,
          paymentMethod: lastPaymentRecord.paymentMethod
        }
      } else if (user.stripeCustomerId) {
        try {
          const payments = []

          // 1. All paid invoices (includes $0)
          const invoices = await stripe.invoices.list({
            customer: user.stripeCustomerId,
            status: "paid",
            limit: 100
          })

          invoices.data.forEach((inv) => {
            payments.push({
              date: new Date(inv.created * 1000),
              amount: inv.amount_paid / 100,
              invoiceId: inv.id,
              paymentMethod: inv.payment_intent
                ? inv.payment_intent.payment_method_types?.[0] || "unknown"
                : "unknown",
              source: "invoice"
            })
          })

          // 2. All successful charges (includes one-off payments and $0)
          const charges = await stripe.charges.list({
            customer: user.stripeCustomerId,
            limit: 100
          })

          charges.data
            .filter((c) => c.paid && c.status === "succeeded")
            .forEach((charge) => {
              payments.push({
                date: new Date(charge.created * 1000),
                amount: charge.amount / 100,
                invoiceId: charge.invoice || charge.id, // charge.id for one-off
                paymentMethod: charge.payment_method_details?.type || "card",
                source: "charge"
              })
            })

          // 3. Deduplicate by invoiceId + source
          const uniquePayments = payments.filter(
            (p, idx, arr) =>
              idx ===
              arr.findIndex(
                (pp) => pp.invoiceId === p.invoiceId && pp.source === p.source
              )
          )

          // 4. Sort newest first
          uniquePayments.sort((a, b) => b.date - a.date)

          // ✅ Assign latest to main lastPayment variable
          if (uniquePayments.length > 0) {
            lastPayment = uniquePayments[0]
          }

          console.log({ lastPayment, allPayments: uniquePayments })
        } catch (err) {
          console.error("❌ Stripe fetch error:", err.message)
        }
      }

      // Step 3: Stripe billing info (trial-aware)
      let nextBillingDate = null
      let discountedAmount = null

      try {
        const subscription = await stripe.subscriptions.retrieve(
          selectedSub.stripeSubscriptionId
        )

        console.log("SUBSCRIPTION DETAIL", subscription)

        // ✅ Prefer trial_end if still in trial Date.now() + (3 * 24 * 60 * 60 * 1000)
        if (
          subscription?.trial_end &&
          subscription.trial_end * 1000 > Date.now()
        ) {
          nextBillingDate = new Date(subscription.trial_end * 1000)
        } else if (subscription?.current_period_end) {
          nextBillingDate = new Date(subscription.current_period_end * 1000)
        }

        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          subscription: subscription.id,
          customer: subscription.customer
        })

        if (upcomingInvoice?.total !== undefined) {
          discountedAmount = upcomingInvoice.total / 100
        }
      } catch (err) {
        console.error("❌ Stripe fetch error:", err.message)
      }

      // Step 4: Remaining usage
      const remaining = {
        jobApplicationsToday: Math.max(
          0,
          planSnapshot.dailyLimit - usage.jobApplicationsToday
        ),
        monthlyCredits:
          Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed) +
          extraCredits,
        extraCredits,
        resumeProfiles: Math.max(
          0,
          planSnapshot.resumeProfiles - usage.resumeProfilesUsed
        ),
        tailoredResumes: Math.max(
          0,
          planSnapshot.freeTailoredResumes - usage.tailoredResumesUsed
        ),
        autoApplies: Math.max(
          0,
          planSnapshot.freeAutoApplies - usage.autoAppliesUsed
        )
      }

      const features = {
        includesAutoApply: planSnapshot.includesAutoApply,
        includesResumeBuilder: planSnapshot.includesResumeBuilder,
        includesResumeScore: planSnapshot.includesResumeScore,
        includesAICoverLetters: planSnapshot.includesAICoverLetters,
        includesInterviewBuddy: planSnapshot.includesInterviewBuddy,
        includesTailoredResumes: planSnapshot.includesTailoredResumes
      }

      // Step 5: Response
      return res.status(200).json({
        success: true,
        subscription: {
          planName: selectedSub.isTrialPeriod
            ? `${planSnapshot.name} Trial period`
            : planSnapshot.name,
          planPrice: planSnapshot.price,
          billingCycle: planSnapshot.billingCycle,
          paymentMethod: lastPayment.paymentMethod || "Card",
          lastPayment: {
            date: lastPayment.date,
            amount: lastPayment.amount,
            invoiceId: lastPayment.invoiceId
          },
          startDate: selectedSub.startDate,
          endDate: selectedSub.endDate,
          dailyLimit: planSnapshot.dailyLimit,
          monthlyCredits: planSnapshot.monthlyCredits,
          usage,
          remaining,
          features,
          nextBillingDate,
          discountedAmount,
          isCancelled: selectedSub.isCancelled,
          cancelAt: selectedSub.cancelAt
        }
      })
    } catch (err) {
      console.error("❌ Error in userAccountBilling:", err)
      return res.status(500).json({
        success: false,
        msg: "Error fetching subscription usage",
        error: err.message
      })
    }
  },

  deductUserCredits: async (req, res) => {
    try {
      const userId = req.token._id
      const { credits } = req.body

      if (!credits || typeof credits !== "number" || credits <= 0) {
        return res.status(400).json({
          success: false,
          msg: "Valid 'credits' number is required in the request body."
        })
      }

      await services.deductUserCredits(userId, credits)

      return res.status(200).json({
        success: true,
        msg: `${credits} credits deducted successfully.`
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: error.message || "Failed to deduct credits."
      })
    }
  },

  // Submit user onboarding data after Google sign-in
  submitUserOnboarding: async (req, res) => {
    try {
      const userId = req.token._id
      const onboardingData = req.body

      if (!userId) {
        return res.status(400).json({
          success: false,
          msg: "User ID is required"
        })
      }

      // Check if user exists
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User not found"
        })
      }

      // Import UserOnboarding model
      const UserOnboarding = require("../models/userOnboarding.model")

      // Check if onboarding data already exists
      let existingOnboarding = await UserOnboarding.findOne({ userId })

      if (existingOnboarding) {
        // Update existing onboarding data
        const updatedOnboarding = await UserOnboarding.findByIdAndUpdate(
          existingOnboarding._id,
          {
            ...onboardingData,
            userId,
            isCompleted: true
          },
          { new: true }
        )

        return res.status(200).json({
          success: true,
          msg: "Onboarding data updated successfully",
          onboarding: updatedOnboarding
        })
      } else {
        // Create new onboarding data
        const newOnboarding = new UserOnboarding({
          ...onboardingData,
          userId,
          isCompleted: true
        })

        const savedOnboarding = await newOnboarding.save()

        return res.status(201).json({
          success: true,
          msg: "Onboarding data submitted successfully",
          onboarding: savedOnboarding
        })
      }
    } catch (error) {
      console.error("User onboarding submission error:", error)
      return res.status(500).json({
        success: false,
        msg: "Failed to submit onboarding data",
        error: error.message
      })
    }
  }
}

module.exports = methods
