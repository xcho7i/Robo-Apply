// import React from 'react'

// const FormatingComponent = () => {
//   return (
//     <div><p>
//       You need to formate HardSkills and SoftSkills according to the other fields
//       </p>
//       </div>
//   )
// }

// export default FormatingComponent
import React from "react";

const FormatingComponent = () => {
  // Get formatting data from localStorage
  const formattingData = JSON.parse(localStorage.getItem("resumeFormatting"));
  const summary = formattingData?.summary;

  return (
    <div>
      {summary ? (
        <div className="mt-4 p-4 border rounded-md border-purple bg-purple/10 text-sm text-primary">
          {summary}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          No formatting suggestions available at the moment.
        </p>
      )}
    </div>
  );
};

export default FormatingComponent;
