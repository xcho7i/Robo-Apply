// ViewAndDownloadMenu.js
import React from "react";

const ViewAndDownloadMenu = ({ onView, onDownload }) => {
  return (
    <div className="absolute bg-almostBlack  shadow-md rounded-md mt-4 w-40 mr-0 right-0">
      <button
        onClick={onView}
        className="block w-full text-left px-4 py-2 text-primary border mt-2 border-t-customGray border-b-0 border-l-0 border-r-0 bg-almostBlack hover:bg-lightGreyBackgrounds transition-colors hover:bg-lightestGrey hover:text-black"
      >
        View
      </button>
      <button
        onClick={onDownload}
        className="block w-full text-left px-4 py-2 border mb-2  border-b-customGray border-l-0 border-t-0 border-r-0  text-primary bg-almostBlack hover:bg-lightGreyBackgrounds transition-colors hover:bg-lightestGrey hover:text-black"
      >
        Download
      </button>
    </div>
  );
};

export default ViewAndDownloadMenu;
