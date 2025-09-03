// import React, { useState, useEffect } from "react";
// import { IoMdClose } from "react-icons/io";
// import { errorToast } from "../../Toast";
// import SimpleInputField from "../../SimpleInputFields";
// import DatePickerInput from "../../DatePickerInput";
// import Button from "../../Button";

// const AddQualificationModal = ({
//   isOpen,
//   onClose,
//   onAddQualification,
//   initialData = {},
//   onSave,
// }) => {
//   const [institutionName, setInstitutionName] = useState("");
//   const [institutionType, setInstitutionType] = useState("");
//   const [institutionCity, setInstitutionCity] = useState("");
//   const [institutionState, setInstitutionState] = useState("");
//   const [major, setMajor] = useState("");
//   const [degreeType, setDegreeType] = useState("");
//   const [gpa, setGpa] = useState("");
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);

//   useEffect(() => {
//     if (isOpen) {
//       // Set fields from initialData when modal opens and hasn't been initialized
//       setInstitutionName(initialData.institutionName || "");
//       setInstitutionType(initialData.institutionType || "");
//       setInstitutionCity(initialData.institutionCity || "");
//       setInstitutionState(initialData.institutionState || "");
//       setMajor(initialData.major || "");
//       setDegreeType(initialData.degreeType || "");
//       setGpa(initialData.gpa || "");
//       setStartDate(
//         initialData.startDate ? new Date(initialData.startDate) : null
//       );
//       setEndDate(initialData.endDate ? new Date(initialData.endDate) : null);
//     }
//   }, [isOpen, initialData]);

//   const handleSaveQualification = () => {
//     if (
//       !institutionName ||
//       !institutionType ||
//       !major ||
//       !degreeType ||
//       !startDate
//     ) {
//       errorToast("Please fill in all required fields.");
//       return;
//     }

//     const qualificationData = {
//       institutionName,
//       institutionType,
//       institutionCity,
//       institutionState,
//       major,
//       degreeType,
//       gpa,
//       startDate,
//       endDate,
//     };

//     if (initialData.id !== undefined) {
//       onSave(initialData.id, qualificationData);
//     } else {
//       onAddQualification(qualificationData);
//     }

//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       id="add-qualification-modal-container"
//       className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
//       onClick={(e) =>
//         e.target.id === "add-qualification-modal-container" && onClose()
//       }
//     >
//       <div className="bg-modalPurple rounded-lg p-8 w-full md:max-w-[50%] mt-10 relative border border-customGray">
//         <Button
//           onClick={onClose}
//           className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
//         >
//           <IoMdClose size={24} />
//         </Button>

//         <h2 className="text-2xl font-semibold text-primary mb-4">
//           {initialData.id !== undefined
//             ? "Edit Qualification"
//             : "Add Qualification"}
//         </h2>

//         <div className="md:flex md:flex-col md:space-y-4 border border-x-0 border-customGray py-5">
//           <SimpleInputField
//             placeholder="Enter Institution Name"
//             value={institutionName}
//             onChange={(e) => setInstitutionName(e.target.value)}
//             className="w-full"
//           />

//           <div className="md:flex md:space-x-4">
//             {/* <SimpleInputField
//               placeholder="Enter Institution Type"
//               value={institutionType}
//               onChange={(e) => setInstitutionType(e.target.value)}
//               className="w-full"
//             /> */}
//             <div className="w-full items-center flex">
//               <select
//                 value={institutionType}
//                 onChange={(e) => setInstitutionType(e.target.value)}
//                 className="w-full bg-dropdownBackground text-primary border border-formBorders px-3 py-3 rounded-md shadow-sm"
//               >
//                 <option className="bg-modalPurple" value="">
//                   Select Institution Type
//                 </option>
//                 <option className="bg-modalPurple" value="University">
//                   University
//                 </option>
//                 <option className="bg-modalPurple" value="College">
//                   College
//                 </option>
//                 <option className="bg-modalPurple" value="Institute">
//                   Institute
//                 </option>
//                 <option className="bg-modalPurple" value="Online">
//                   Online
//                 </option>
//               </select>
//             </div>
//             <SimpleInputField
//               placeholder="Enter Institution City"
//               value={institutionCity}
//               onChange={(e) => setInstitutionCity(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           <div className="md:flex md:space-x-4">
//             <SimpleInputField
//               placeholder="Institution State"
//               value={institutionState}
//               onChange={(e) => setInstitutionState(e.target.value)}
//               className="w-full"
//             />
//             <SimpleInputField
//               placeholder="Major"
//               value={major}
//               onChange={(e) => setMajor(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           <div className="md:flex w-full md:space-x-4">
//             {/* <SimpleInputField
//               placeholder="Degree Type"
//               value={degreeType}
//               onChange={(e) => setDegreeType(e.target.value)}
//               className="w-full"
//             /> */}
//             <div className="w-full items-center flex">
//               <select
//                 value={degreeType}
//                 onChange={(e) => setDegreeType(e.target.value)}
//                 className="w-full bg-dropdownBackground text-primary border border-formBorders px-3 py-3 rounded-md shadow-sm"
//               >
//                 <option className="bg-modalPurple" value="">
//                   Select Degree Type
//                 </option>
//                 <option className="bg-modalPurple" value="Bachelor's">
//                   Bachelor's
//                 </option>
//                 <option className="bg-modalPurple" value="Master's">
//                   Master's
//                 </option>
//                 <option className="bg-modalPurple" value="PhD">
//                   PhD
//                 </option>
//                 <option className="bg-modalPurple" value="Diploma">
//                   Diploma
//                 </option>
//                 <option className="bg-modalPurple" value="Certificate">
//                   Certificate
//                 </option>
//               </select>
//             </div>
//             <SimpleInputField
//               placeholder="GPA"
//               value={gpa}
//               onChange={(e) => setGpa(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           <div className="md:flex md:space-x-4">
//             <DatePickerInput
//               placeholder="Start Date"
//               selectedDate={startDate}
//               onChange={setStartDate}
//               className="w-full"
//             />
//             <DatePickerInput
//               placeholder="End Date"
//               selectedDate={endDate}
//               onChange={setEndDate}
//               className="w-full"
//             />
//           </div>
//         </div>

//         <div className="flex justify-end mt-3 mb-5 space-x-4">
//           <Button
//             onClick={onClose}
//             className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
//           >
//             Close
//           </Button>
//           <Button
//             onClick={handleSaveQualification}
//             className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
//           >
//             {initialData.id !== undefined
//               ? "Save Changes"
//               : "Add Qualification"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddQualificationModal;

import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { errorToast } from "../../Toast";
import SimpleInputField from "../../SimpleInputFields";
import DatePickerInput from "../../DatePickerInput";
import Button from "../../Button";

const AddQualificationModal = ({
  isOpen,
  onClose,
  onAddQualification,
  initialData = {},
  onSave,
}) => {
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [institutionCity, setInstitutionCity] = useState("");
  const [institutionState, setInstitutionState] = useState("");
  const [major, setMajor] = useState("");
  const [degreeType, setDegreeType] = useState("");
  const [gpa, setGpa] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setInstitutionName(initialData.institutionName || "");
      setInstitutionType(initialData.institutionType || "");
      setInstitutionCity(initialData.institutionCity || "");
      setInstitutionState(initialData.institutionState || "");
      setMajor(initialData.major || "");
      setDegreeType(initialData.degreeType || "");
      setGpa(initialData.gpa || "");

      // Safely parse startDate
      if (
        initialData.startDate &&
        initialData.startDate !== "null" &&
        initialData.startDate !== ""
      ) {
        const parsedStart = new Date(initialData.startDate);
        setStartDate(isNaN(parsedStart) ? null : parsedStart);
      } else {
        setStartDate(null);
      }

      // Safely parse endDate
      if (
        initialData.endDate &&
        initialData.endDate !== "null" &&
        initialData.endDate !== ""
      ) {
        const parsedEnd = new Date(initialData.endDate);
        setEndDate(isNaN(parsedEnd) ? null : parsedEnd);
      } else {
        setEndDate(null);
      }
    }
  }, [isOpen, initialData]);

  const handleSaveQualification = () => {
    if (
      !institutionName ||
      !institutionType ||
      !major ||
      !degreeType ||
      !startDate
    ) {
      errorToast("Please fill in all required fields.");
      return;
    }

    const qualificationData = {
      institutionName,
      institutionType,
      institutionCity,
      institutionState,
      major,
      degreeType,
      gpa,
      startDate,
      endDate,
    };

    if (initialData.id !== undefined) {
      onSave(initialData.id, qualificationData);
    } else {
      onAddQualification(qualificationData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="add-qualification-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) =>
        e.target.id === "add-qualification-modal-container" && onClose()
      }
    >
      <div className="bg-modalPurple rounded-lg p-8 w-full md:max-w-[50%] mt-10 relative border border-customGray">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>

        <h2 className="text-2xl font-semibold text-primary mb-4">
          {initialData.id !== undefined ? "Edit Education" : "Add Education"}
        </h2>

        <div className="md:flex md:flex-col md:space-y-4 border border-x-0 border-customGray py-5">
          <SimpleInputField
            placeholder="Enter Institution Name"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            className="w-full"
          />

          <div className="md:flex md:space-x-4">
            <div className="w-full items-center flex">
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                className="w-full bg-dropdownBackground text-primary border border-formBorders px-3 py-3 rounded-md shadow-sm"
              >
                <option className="bg-modalPurple" value="">
                  Select Institution Type
                </option>
                <option className="bg-modalPurple" value="University">
                  University
                </option>
                <option className="bg-modalPurple" value="College">
                  College
                </option>
                <option className="bg-modalPurple" value="Institute">
                  Institute
                </option>
                <option className="bg-modalPurple" value="Online">
                  Online
                </option>
              </select>
            </div>
            <SimpleInputField
              placeholder="Enter Institution City"
              value={institutionCity}
              onChange={(e) => setInstitutionCity(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:flex md:space-x-4">
            <SimpleInputField
              placeholder="Institution State"
              value={institutionState}
              onChange={(e) => setInstitutionState(e.target.value)}
              className="w-full"
            />
            <SimpleInputField
              placeholder="Major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="md:flex w-full md:space-x-4">
            <div className="w-full items-center flex">
              <select
                value={degreeType}
                onChange={(e) => setDegreeType(e.target.value)}
                className="w-full bg-dropdownBackground text-primary border border-formBorders px-3 py-3 rounded-md shadow-sm"
              >
                <option className="bg-modalPurple" value="">
                  Select Degree Type
                </option>
                <option className="bg-modalPurple" value="Bachelor's">
                  Bachelor's
                </option>
                <option className="bg-modalPurple" value="Master's">
                  Master's
                </option>
                <option className="bg-modalPurple" value="PhD">
                  PhD
                </option>
                <option className="bg-modalPurple" value="Diploma">
                  Diploma
                </option>
                <option className="bg-modalPurple" value="Certificate">
                  Certificate
                </option>
              </select>
            </div>
            <SimpleInputField
              type="number"
              placeholder="GPA"
              value={gpa}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= 0.1 && value <= 5.0) {
                  setGpa(e.target.value);
                } else if (e.target.value === "") {
                  setGpa("");
                }
              }}
              step="0.1"
              min="0.1"
              max="5.0"
              className="w-full"
            />
          </div>

          <div className="md:flex md:space-x-4">
            <DatePickerInput
              placeholder="Start Date"
              selectedDate={startDate}
              onChange={setStartDate}
              className="w-full"
            />
            <DatePickerInput
              placeholder="End Date"
              selectedDate={endDate}
              onChange={setEndDate}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end mt-3 mb-5 space-x-4">
          <Button
            onClick={onClose}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Close
          </Button>
          <Button
            onClick={handleSaveQualification}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            {initialData.id !== undefined ? "Save Changes" : "Add Education"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddQualificationModal;
