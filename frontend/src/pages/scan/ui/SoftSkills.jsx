// import React from "react";
// import SkillsData from "./SkillsData";
// import { FaFontAwesomeFlag } from "react-icons/fa";
// import { IoMdClose } from "react-icons/io";
// import { TiTick } from "react-icons/ti";
// import Button from "../../../components/Button";

// const SoftSkills = () => {
//   const onClose = () => {
//     console.log("Close button clicked");
//   };

//   return (
//     <div>
//       {SkillsData.map((skills) => (
//         <div key={skills.id} className="flex mb-4 gap-24">
//           <div className="mb-2 border border-customGray w-3/5 py-1 pl-2">
//             <p className="mr-3 text-base">{skills.name}</p>
//           </div>
//           <div className="  w-1/5">
//             <div className="flex justify-end items-center gap-5 w-full">
//               <div className="relative">
//                 {skills.value === "Approved" && (
//                   <FaFontAwesomeFlag size={24} className="text-purple" />
//                 )}
//               </div>

//               {skills.value === "Not Approved" ? (
//                 <Button
//                   className="bg-gradient-to-b rounded-full z-50 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
//                   onClick={onClose}
//                 >
//                   <IoMdClose size={24} color="#000" />
//                 </Button>
//               ) : (
//                 <Button
//                   className="bg-green rounded-full z-50 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
//                   onClick={onClose}
//                 >
//                   <TiTick size={24} color="white" />
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SoftSkills;

import React from "react";
import { FaFontAwesomeFlag } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import Button from "../../../components/Button";

const SoftSkills = () => {
  const onClose = () => {
    console.log("Close button clicked");
  };

  // Fetch soft skills data from localStorage
  const skillsData = JSON.parse(localStorage.getItem("resumeSoftSkills")) || [];

  return (
    <div>
      {skillsData.length === 0 ? (
        <p className="text-gray-400 text-sm">No soft skills data available.</p>
      ) : (
        skillsData.map((skills) => (
          <div key={skills.id} className="flex mb-4 gap-24">
            <div className="mb-2 border border-customGray w-3/5 py-1 pl-2">
              <p className="mr-3 text-base">{skills.name}</p>
            </div>
            <div className="w-1/5">
              <div className="flex justify-end items-center gap-5 w-full">
                <div className="relative">
                  {skills.value === "Approved" && (
                    <FaFontAwesomeFlag size={24} className="text-purple" />
                  )}
                </div>

                {skills.value === "Not Approved" ? (
                  <Button
                    className="bg-gradient-to-b rounded-full z-50 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
                    onClick={onClose}
                  >
                    <IoMdClose size={24} color="#000" />
                  </Button>
                ) : (
                  <Button
                    className="bg-green rounded-full z-50 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
                    onClick={onClose}
                  >
                    <TiTick size={24} color="white" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SoftSkills;
