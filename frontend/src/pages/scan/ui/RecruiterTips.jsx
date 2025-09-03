// import React from "react";
// import EmptyComponent from "./EmptyComponent";
// import FilledComponent from "./FilledComponent";
// import ContactData from "./ContactData";

// const RecruiterTips = () => {
//   return (
//     <div>
//       <h3>
//         Applicant Tracking Systems (ATS) are computers that process your resume
//         to understand your work history and relevance to the job description.
//         These findings typically include your work history, job titles, relevant
//         skills and education, as well as contact information like your name,
//         phone number, and email address.
//       </h3>
//       {ContactData.map((data) => {
//         const {
//           id,
//           heading,
//           tipTitle,
//           titleComponent,
//           tipContent,
//           additionalInfo,
//         } = data;

//         const shouldShowFilled = heading && tipTitle;

//         return (
//           <div key={id}>
//             {shouldShowFilled ? (
//               <FilledComponent
//                 heading={heading}
//                 titleComponent={titleComponent}
//                 tipTitle={tipTitle}
//                 tipContent={tipContent}
//                 additionalInfo={additionalInfo}
//                 onClose
//               />
//             ) : (
//               <EmptyComponent
//                 heading={heading}
//                 tipTitle={tipTitle}
//                 titleComponent={titleComponent}
//                 tipContent={tipContent}
//                 onClose
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default RecruiterTips;

import React from "react";

const RecruiterTips = () => {
  // Get summary from localStorage
  const recruiterTipsData = JSON.parse(
    localStorage.getItem("resumeRecruiter_Tips")
  );
  const summary = recruiterTipsData?.summary;

  return (
    <div>
      {summary ? (
        <div className="mt-4 p-4 border rounded-md border-purple bg-purple/10 text-sm text-primary">
          {summary}
        </div>
      ) : (
        <p className="mt-4 text-sm ">
          No recruiter tips available at the moment.
        </p>
      )}
    </div>
  );
};

export default RecruiterTips;
