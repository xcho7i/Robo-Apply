// ResumeAnalysisTable.js
import React from "react";
import { MdOutlineDone } from "react-icons/md";
import { ImCross } from "react-icons/im";

const ResumeAnalysisTable = ({ analysisData }) => {
  return (
    <div className="p-5 rounded-lg">
      <table className="min-w-full text-left text-sm text-white">
        <tbody>
          {analysisData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 text-center ">
                <img src={item.icon} className="w-20" loading="lazy" />
              </td>
              <td className="px-6 py-4 font-bold text-xl whitespace-nowrap overflow-hidden overflow-ellipsis">
                {item.label}
              </td>
              <td className="px-6 py-4 text-justify text-lg font-normal">
                {item.description}
              </td>
              <td className="px-6 py-4 text-center text-4xl">
                {item.status ? (
                  <MdOutlineDone className="text-tickPurle text-5xl" />
                ) : (
                  <ImCross className="text-danger text-2xl" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResumeAnalysisTable;
