const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const UserSubscription = require("../models/userSubscriptionModel")
const User = require("../models/user.model") // adjust the path accordingly
const axios = require("axios")


dotenv.config()

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_PASS
  }
})

const methods = {
  sendResetPasswordMail: async (email, token, res) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.BREVO_SENDER,
        to: email,
        subject: "Reset your Password",
        text: "Reset your forgotten Password",
        html: `<p>Dear User,<br><br>
        We received a request to reset your password. Your OTP is:${token}<br><br>
        If you did not request a password reset, please ignore this email.<br><br>
        Thank you,<br>
        The Team</p>`
      })
      console.log("Reset Password Email sent", info.messageId)
    } catch (error) {
      console.error("Failed to send email:", error)
    }
  },

  sendResetPasswordMailBrevo: async (email, token, res) => {
    try {
      const apiKey = process.env.BREVO_API_KEY;
      const sender = {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER
      };

      const to = [{ email }];
      const subject = "Reset your Password";
      const htmlContent = `<p>Dear User,<br><br>
        We received a request to reset your password. Your OTP is: <strong>${token}</strong><br><br>
        If you did not request a password reset, please ignore this email.<br><br>
        Thank you,<br>
        The Team</p>`;

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender,
          to,
          subject,
          htmlContent,
        },
        {
          headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
        }
      );

      console.log("Reset Password Email sent via Brevo API");
      return response.data;
    } catch (error) {
      console.error("Failed to send email via Brevo API:");
      console.log(error.response);
      // throw error;
    }
  },

  sendVerificationMail: async (email, otp) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.BREVO_SENDER,
        to: email,
        subject: "Verify Your Account",
        text: `Your OTP code is ${otp}`,
        html: `<p>Dear User,<br><br>
               Your OTP code for verifying your account is: <strong>${otp}</strong><br><br>
               If you did not request this, please ignore this email.<br><br>
               Thank you,<br>The Team</p>`
      })
      console.log("Verification Email sent:", info.messageId)
    } catch (error) {
      console.error("Failed to send email:", error)
    }
  },

  sendVerificationMailBrevo: async (email, otp) => {
    try {
      const apiKey = process.env.BREVO_API_KEY;
      const sender = {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL
      };

      const to = [{ email }];
      const subject = "Verify Your Account";
      const htmlContent = `<p>Dear User,<br><br>
               Your OTP code for verifying your account is: <strong>${otp}</strong><br><br>
               If you did not request this, please ignore this email.<br><br>
               Thank you,<br>The Team</p>`;

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender,
          to,
          subject,
          htmlContent,
        },
        {
          headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
        }
      );

      console.log("Verification Email sent via Brevo API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to send email via Brevo API:", error.response?.data || error.message);
      throw error;
    }
  },

  sendEmail: async (to, subject, html) => {
    try {
      console.log(`📧 Attempting to send email to ${to}`);
      console.log(`📧 Subject: ${subject}`);
      
      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        throw new Error("BREVO_API_KEY is not configured");
      }

      const sender = {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER
      };

      if (!sender.name || !sender.email) {
        throw new Error("BREVO_SENDER_NAME or BREVO_SENDER is not configured");
      }

      // Ensure 'to' is an array of objects with email property
      const toArray = Array.isArray(to) ? to : [{ email: to }];

      console.log(`📧 Sending via Brevo API to:`, toArray);

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender,
          to: toArray,
          subject,
          htmlContent: html,
        },
        {
          headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
        }
      );

      console.log(`✅ Email sent successfully via Brevo API`);
      console.log(`✅ Brevo response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to send email via Brevo API:`, error);
      if (error.response) {
        console.error(`❌ Brevo API error response:`, error.response.data);
      }
      throw error;
    }
  },


  // checkUserCredits : async (userId, creditsRequired) => {
  // const userSub = await UserSubscription.findOne({ userId, isActive: true });

  // if (!userSub) {
  //   throw new Error("No active subscription found.");
  // }

  // const { planSnapshot, usage } = userSub;

  // const remainingCredits = Math.max(0, planSnapshot.monthlyCredits - usage.monthlyCreditsUsed);

  // if (remainingCredits < creditsRequired) {
  //   throw new Error(`You need at least ${creditsRequired} credits to perform this action.`);
  // }

  // return true;
  // },

  //  deductUserCredits: async (userId, credits) => {
  // const userSub = await UserSubscription.findOne({ userId, isActive: true });

  // if (!userSub) {
  //   throw new Error("No active subscription found.");
  // }

  // userSub.usage.monthlyCreditsUsed += credits;

  // await userSub.save();

  // return true;
  // },

  checkUserCredits: async (userId, creditsRequired) => {
    const userSub = await UserSubscription.findOne({ userId, isActive: true })

    if (!userSub) {
      throw new Error("No active subscription found.")
    }

    const { planSnapshot, usage } = userSub
    const remainingCredits = Math.max(
      0,
      planSnapshot.monthlyCredits - usage.monthlyCreditsUsed
    )

    if (
      planSnapshot.identifier === "free_plan" &&
      usage.monthlyCreditsUsed >= 60
    ) {
      await User.findByIdAndUpdate(userId, { isFreePlanExpired: true })
      throw new Error("Free plan expired. Please upgrade your plan.")
    }

    if (remainingCredits < creditsRequired) {
      throw new Error(
        `You need at least ${creditsRequired} credits to perform this action.`
      )
    }

    return true
  },

  deductUserCredits: async (userId, credits) => {
    const CreditsValues = {
      AutoApply: 6,
      TailoredResume: 13,
      AICoverLetter: 7,
      ResumeBuilder: 9,
      ResumeScore: 8,
      InterviewBuddy: 15
    }

    const userSub = await UserSubscription.findOne({ userId, isActive: true })

    if (!userSub) {
      throw new Error("No active subscription found.")
    }

    userSub.usage.monthlyCreditsUsed += credits
    if (credits === CreditsValues.AutoApply) {
      userSub.usage.autoAppliesUsed += 1
    }

    const isFreePlan = userSub.planSnapshot.identifier === "free_plan"
    const updatedCredits = userSub.usage.monthlyCreditsUsed

    if (isFreePlan && updatedCredits >= 60) {
      await User.findByIdAndUpdate(userId, { isFreePlanExpired: true })
    }

    await userSub.save()
    return true
  },

  checkUserResumeProfiles: async (userId) => {
    const userSub = await UserSubscription.findOne({ userId, isActive: true })
    if (!userSub) throw new Error("No active subscription found.")

    const remainingProfiles = Math.max(
      0,
      userSub.planSnapshot.resumeProfiles - userSub.usage.resumeProfilesUsed
    )

    if (remainingProfiles <= 0) {
      throw new Error("You have used all your resume profile slots.")
    }

    return true
  },

  deductUserResumeProfile: async (userId) => {
    const userSub = await UserSubscription.findOne({ userId, isActive: true })
    if (!userSub) throw new Error("No active subscription found.")

    userSub.usage.resumeProfilesUsed += 1
    await userSub.save()
    return true
  },

  // Trial Email Campaign Services
  sendTrialActivationEmail: async (userId, emailType) => {
    console.log("ABOUT TO SEND EMAILLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL")
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const emailTemplates = {
      day1: {
        subject: "Your RoboApply trial is live — let's make it pay off",
        html: `
          <p>Welcome aboard! 🚀</p>
          <p>You've got 3 days to hit the ground running — users who apply to 25+ jobs in their first 48 
          hours are 3x more likely to land an interview within 2 weeks.</p>
          <p>Here's your action plan:</p>
          <p>✅ Auto Apply to dozens of roles instantly<br>
          ✅ Use Tailored Resumes for higher response rates<br>
          ✅ Check your Resume Score and fix weak points</p>
          <p>The more you do now, the faster you'll see results.</p>
          <p><a href="${process.env.ROOT_URL}/auto-apply">Start Applying Now →</a></p>
        `
      },
      day2: {
        subject: "2 days left in your free trial — keep pushing",
        html: `
          <p>With 48 hours left, now's the time to stack up interviews.</p>
          <p>Top performers send 40+ targeted applications during their trial — it's what keeps their inbox 
          full of recruiter emails.</p>
          <p>🚀 Pro Tip: Run Auto Apply twice a day — morning and evening — to catch new job postings.</p>
          <p><a href="${process.env.ROOT_URL}/auto-apply">Send More Applications →</a></p>
        `
      },
      day3Morning: {
        subject: "Last day of free trial — secure your next role faster",
        html: `
          <p>This is your final free trial day.</p>
          <p>Every job you apply to today stays in your profile — and Auto Apply keeps working after your 
          trial ends, so you can continue the momentum without losing a step.</p>
          <p>✅ Save your resumes & history<br>
          ✅ Keep your application streak alive<br>
          ✅ Boost your Resume Score for higher callbacks</p>
          <p><a href="${process.env.ROOT_URL}/auto-apply">Apply Before Midnight →</a></p>
        `
      },
      day3Evening: {
        subject: "Don't lose the progress you've made",
        html: `
          <p>You've done the hard part — getting started.</p>
          <p>Now let's keep the results coming.</p>
          <p>When your trial ends tonight, your account automatically upgrades so you can:</p>
          <p>✅ Keep all your saved resumes, job history, and profile<br>
          ✅ Continue Auto Applying without interruption<br>
          ✅ Access Tailored Resumes & Resume Score anytime<br>
          ✅ Stay ahead of other applicants with daily applications</p>
          <p>🚀 Fact: Members who stay active for 30 days get 2–3x more recruiter callbacks.</p>
          <p>You've already built momentum — don't let it stop here.</p>
          <p><a href="${process.env.ROOT_URL}/auto-apply">Continue Your Job Hunt →</a></p>
        `
      }
    };

    const template = emailTemplates[emailType];
    if (!template) throw new Error("Invalid email type");

    // Send email first
    await methods.sendEmail(user.email, template.subject, template.html);
    console.log(`✅ Trial activation email sent successfully`);

    // Prepare update based on email type
    let updateQuery = {
      'trialEmailCampaign.lastEmailSentAt': new Date()
    };

    switch(emailType) {
      case 'day1':
        updateQuery['trialEmailCampaign.activationEmails.day1Sent'] = true;
        break;
      case 'day2':
        updateQuery['trialEmailCampaign.activationEmails.day2Sent'] = true;
        break;
      case 'day3Morning':
        updateQuery['trialEmailCampaign.activationEmails.day3MorningSent'] = true;
        break;
      case 'day3Evening':
        updateQuery['trialEmailCampaign.activationEmails.day3EveningSent'] = true;
        break;
    }

    // Update email campaign status atomically
    console.log(`📝 Updating email campaign status for ${emailType}`);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update email campaign status');
    }

    console.log(`✅ Updated user email campaign status in database`);
    
    // Log current email status
    console.log(`📧 Current email status:`, {
      lastEmailSentAt: updatedUser.trialEmailCampaign.lastEmailSentAt,
      activationEmails: updatedUser.trialEmailCampaign.activationEmails
    });
  },

  sendTrialCancellationEmail: async (userId, emailType) => {
    console.log("ABOUT TO SEND EMAILLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL")
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const userSub = await UserSubscription.findOne({ userId, isActive: true });
    if (!userSub) throw new Error("No active subscription found");

    // Get fresh data from Stripe to ensure accuracy
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    let trialEndDate;
    let stripeSubscription = null;

    try {
      // Fetch subscription data from Stripe
      if (userSub.stripeSubscriptionId) {
        stripeSubscription = await stripe.subscriptions.retrieve(userSub.stripeSubscriptionId);
        console.log(`🔍 Retrieved Stripe subscription data:`);
        console.log(`🔍 Status: ${stripeSubscription.status}`);
        console.log(`🔍 Trial end: ${stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : 'N/A'}`);
        console.log(`🔍 Cancel at: ${stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : 'N/A'}`);
        console.log(`🔍 Cancel at period end: ${stripeSubscription.cancel_at_period_end}`);
        
        // Use Stripe's trial_end if available (most accurate for trials)
        if (stripeSubscription.trial_end) {
          trialEndDate = new Date(stripeSubscription.trial_end * 1000);
          console.log(`🔍 Using Stripe trial_end date: ${trialEndDate}`);
        }
        // Use Stripe's cancel_at if trial_end is not available
        else if (stripeSubscription.cancel_at) {
          trialEndDate = new Date(stripeSubscription.cancel_at * 1000);
          console.log(`🔍 Using Stripe cancel_at date: ${trialEndDate}`);
        }
      }
    } catch (stripeError) {
      console.error(`❌ Error fetching Stripe subscription data:`, stripeError.message);
    }

    // Fallback to local data if Stripe fetch fails
    if (!trialEndDate) {
      if (userSub.cancelAt) {
        trialEndDate = userSub.cancelAt;
        console.log(`🔍 Using local cancelAt date: ${trialEndDate}`);
      } else {
        // Final fallback: calculate 3 days from trial start
        trialEndDate = new Date(userSub.startDate);
        trialEndDate.setDate(trialEndDate.getDate() + 3);
        console.log(`🔍 Using calculated date (3 days from start): ${trialEndDate}`);
      }
    }

    console.log(`🔍 Final trial end date for cancellation email: ${trialEndDate}`);

    const emailTemplates = {
      immediate: {
        subject: `Your account will be deleted on ${trialEndDate.toLocaleDateString()}`,
        html: `
          <p>Hi ${user.firstName},</p>
          <p>You've canceled your RoboApply trial — but your resume, job history, and profile are still 
          saved.</p>
          <p>They'll be deleted on ${trialEndDate.toLocaleDateString()} unless you reactivate today.</p>
          <p>Special offer: Keep everything and get 30% off for the next 3 months.</p>
          <p><a href="${process.env.ROOT_URL}/billing">Reactivate Now →</a></p>
        `
      },
      after24h: {
        subject: "You'll lose your resume and job history",
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Your trial ends soon, and once it does, you'll lose access to:</p>
          <p>✔ Your stored resumes<br>
          ✔ Tailored job applications<br>
          ✔ Job history & progress</p>
          <p>Reactivate now and keep everything for 30% off.</p>
          <p><a href="${process.env.ROOT_URL}/billing">Keep My Account →</a></p>
        `
      },
      finalDay: {
        subject: "Final hours — Your 30% off ends tonight",
        html: `
          <p>Hi ${user.firstName},</p>
          <p>This is your last chance to save 30% for the next 3 months and keep all your RoboApply data.</p>
          <p>Once the clock hits midnight, your profile, resumes, and history will be gone.</p>
          <p><a href="${process.env.ROOT_URL}/billing">Reactivate Now →</a></p>
        `
      }
    };

    const template = emailTemplates[emailType];
    if (!template) throw new Error("Invalid email type");

    // Send email first
    await methods.sendEmail(user.email, template.subject, template.html);
    console.log(`✅ Trial cancellation email sent successfully`);

    // Prepare update based on email type
    let updateQuery = {
      'trialEmailCampaign.lastEmailSentAt': new Date()
    };

    switch(emailType) {
      case 'immediate':
        updateQuery['trialEmailCampaign.cancellationEmails.immediate'] = true;
        break;
      case 'after24h':
        updateQuery['trialEmailCampaign.cancellationEmails.after24h'] = true;
        break;
      case 'finalDay':
        updateQuery['trialEmailCampaign.cancellationEmails.finalDay'] = true;
        break;
    }

    // Update email campaign status atomically
    console.log(`📝 Updating cancellation email status for ${emailType}`);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update email campaign status');
    }

    console.log(`✅ Updated user cancellation email status in database`);
    
    // Log current email status
    console.log(`📧 Current cancellation email status:`, {
      lastEmailSentAt: updatedUser.trialEmailCampaign.lastEmailSentAt,
      cancellationEmails: updatedUser.trialEmailCampaign.cancellationEmails
    });
  }
}

module.exports = methods
