// import React from "react";
// import { IoMdClose } from "react-icons/io";
// import SimpleInputField from "../../SimpleInputFields"; // Adjust the path if needed
// import Button from "../../Button"; // Adjust the path if needed

// const AdvanceSearchModal = ({
//   isOpen,
//   onClose,
//   keywordsIncludeInJobs,
//   setKeywordsIncludeInJobs,
//   keyworldIncludeInJobs,
//   setKeyworldIncludeInJobs,
//   onSave,
// }) => {
//   const handleOutsideClick = (event) => {
//     if (event.target.id === "advance-search-modal-container") {
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       id="advance-search-modal-container"
//       className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
//       onClick={handleOutsideClick}
//     >
//       <div className="bg-modalPurple rounded-lg p-8 w-full max-w-[85%] md:max-w-[35%] relative border">
//         <Button
//           onClick={onClose}
//           className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
//         >
//           <IoMdClose size={24} />
//         </Button>
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-semibold text-primary">
//             Advanced Search
//           </h2>
//         </div>

//         <SimpleInputField
//           label="List of keywords to include in a job title ( comma-separated )"
//           placeholder="For example - software, manager, devops "
//           value={keywordsIncludeInJobs}
//           onChange={(e) => setKeywordsIncludeInJobs(e.target.value)}
//         />

//         <SimpleInputField
//           label="List of keywords to exclude from the job title ( comma-separated )"
//           placeholder="For example - hr, sales, analyst "
//           value={keyworldIncludeInJobs}
//           onChange={(e) => setKeyworldIncludeInJobs(e.target.value)}
//         />

//         <div className="flex justify-center mt-6 space-x-4">
//           <Button
//             onClick={onSave}
//             className="mx-3 px-4 py-3 font-medium bg-gradient-to-b w-full from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
//           >
//             Save Configuration
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdvanceSearchModal;

import React from "react";
import { IoMdClose } from "react-icons/io";
import SimpleInputField from "../../SimpleInputFields"; // Adjust the path if needed
import Button from "../../Button"; // Adjust the path if needed

const AdvanceSearchModal = ({
  isOpen,
  onClose,
  searchHistoryKeyword,
  setSearchHistoryKeyword,
  onSave,
}) => {
  const handleOutsideClick = (event) => {
    if (event.target.id === "advance-search-modal-container") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="advance-search-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-modalPurple rounded-lg p-8 w-full max-w-[85%] md:max-w-[35%] relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary">
            Advanced Search
          </h2>
        </div>

        <SimpleInputField
          label="Keyword to save the job search history"
          placeholder="For example - software, manager, devops"
          value={searchHistoryKeyword}
          onChange={(e) => setSearchHistoryKeyword(e.target.value)}
        />

        <div className="flex justify-center mt-6 space-x-4">
          <Button
            onClick={onSave}
            className="mx-3 px-4 py-3 font-medium bg-gradient-to-b w-full from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvanceSearchModal;
