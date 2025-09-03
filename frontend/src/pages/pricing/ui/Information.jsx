import React from 'react';

const Information = () => {
  return (
    <div className="flex justify-start gap-10 flex-col m-20 text-[#CDCBCF]">
      <div className="flex justify-center">
        <p className="text-[#FEFEFE] text-3xl font-semibold">
          Secure Plan Statement: $99.00 Unlimited Access
        </p>
      </div>
      <div className="flex flex-col justify-start text-[18px]">
        <p>
          Thank you for choosing our{' '}
          <span className="text-white font-bold">$99.00</span> Unlimited Access
          Plan! This plan provides you with comprehensive, unlimited access to
          all our premium features and services. Below are the key benefits of
          this plan:
        </p>
        <p className="text-white font-bold mt-4">Pricing Plans</p>
        <p>
          Find the perfect plan that fits your needs! Whether you're looking for
          a long-term solution or a flexible monthly subscription, we've got you
          covered.
        </p>
        <p>
          Enjoy the full benefits of our service with a one-time payment. No
          recurring fees, just lifetime access!
        </p>
        <ul className=" list-inside list-disc ">
          <li className="">
            One-time Payment:{' '}
            <span className="text-white font-semibold">$99.00</span>
          </li>
          <li className="mb-4">
            Access Duration:{' '}
            <span className="text-white font-semibold">Lifetime</span>
          </li>
          <li className="text-white font-bold">What's Included:</li>
          <ul className="pl-5 list-disc">
            <li>Full access to all features</li>
            <li>Priority customer support</li>
            <li>Free updates and upgrades</li>
            <li>Early access to new tools and features</li>
            <li>Special bonus: Free consultation session</li>
          </ul>
          <p>
            {' '}
            <span className="font-bold text-white">Best for:</span> Users
            looking for long-term value and full-feature access without worrying
            about monthly renewals.
          </p>
        </ul>

        <p className="font-bold text-white"> Additional Benefits: </p>

        <ul className="pl-5 list-disc">
          <li>
            {' '}
            Risk-Free Guarantee: 30-day money-back guarantee on both plans. If
            you're not satisfied, you can request a refund within 30 days of
            purchase.
          </li>

          <li>
            {' '}
            Secure Payments: We use SSL encryption to ensure your payment
            information is safe. Ready to get started? Choose the plan that best
            suits your needs and unlock the full potential of our services
            today! Get Lifetime Subscription Get Monthly Subscription
          </li>
        </ul>

        <p className="font-bold text-white"> Ready to get started: </p>

        <ul className="pl-5 list-disc">
          Choose the plan that best suits your needs and unlock the full
          potential of our services today!
          <li style={{ textDecoration: 'underline' }}>Get Lifetime Subscription</li>
          <li style={{ textDecoration: 'underline' }}>Get Monthly Subscription</li>
        </ul>
      </div>
    </div>
  );
};

export default Information;
