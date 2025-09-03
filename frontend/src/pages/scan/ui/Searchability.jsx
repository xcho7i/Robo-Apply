// import React from "react";
// import EmptyComponent from "./EmptyComponent";
// import FilledComponent from "./FilledComponent";
// import ContactData from "./ContactData";

// const Searchability = () => {
//   return (
//     <div>
//       <h3 className="text-sm md:text-lg">
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

// export default Searchability;

import React from "react";

const Searchability = () => {
  const searchabilityData = JSON.parse(
    localStorage.getItem("resumeSearchability")
  );

  const summary = searchabilityData?.summary;

  console.log(">>>>>>>>>>>>>>", summary);

  return (
    <div className="space-y-4">
      {summary ? (
        <div className="mt-4 p-4 border rounded-md border-purple bg-purple/10 text-sm text-primary">
          <p className="font-semibold mb-1">Scan Summary:</p>
          <p>{summary}</p>
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">
          No scan summary available.
        </div>
      )}
    </div>
  );
};

export default Searchability;
