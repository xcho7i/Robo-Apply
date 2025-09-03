import React from "react";
import { MdOutlineDone } from "react-icons/md";
import { ImCross } from "react-icons/im";

const SkillGapTable = ({ skillData }) => {
  return (
    <div className="p-5 rounded-lg">
      <table className="min-w-full text-center text-sm text-white">
        <thead>
          <tr>
            <th className="px-6 py-3 text-lg font-bold text-left">Skill</th>
            <th className="px-6 py-3 text-lg font-bold">Resume</th>
            <th className="px-6 py-3 text-lg font-bold">Job Description</th>
            <th className="px-6 py-3 text-lg font-bold">Skill Gap</th>
          </tr>
        </thead>
        <tbody>
          {skillData.map((item, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-darkPurple" : ""
              } hover:bg-gray-700 transition-colors`} // Conditional background color for even rows
            >
              <td className="px-6 py-4 text-lg font-normal text-left">
                {item.skill}
              </td>
              <td className="px-6 py-4 text-lg font-normal">{item.resume}</td>
              <td className="px-6 py-4 text-lg font-normal">
                {item.jobDescription}
              </td>
              <td className="px-6 py-4 text-lg font-normal text-center items-center justify-center flex">
                {item.skillGap ? (
                  <MdOutlineDone className="text-tickPurle text-4xl" />
                ) : (
                  <ImCross className="text-danger text-2xl" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-5"></div>
    </div>
  );
};

export default SkillGapTable;
