import React from "react";
import certificationPic from "../../../../assets/resumeManagerIcons/certification.svg";
import Button from "../../../../components/Button";
import link from "../../../../assets/resumeManagerIcons/link.svg";
import EditButton from "../../../resumeManager/ui/EditButton";
import DeleteButton from "../../../resumeManager/ui/DeleteButton";

const AddCertificateResume = ({
  certifications,
  onEditCertification,
  onDeleteCertification,
  onAddCertification,
}) => {
  return (
    <div>
      <div className="items-center justify-start w-full flex pt-2 md:pt-7 pb-7">
        <p className="text-xl text-primary font-normal border-b-2 border-purple pb-1">
          Certifications
        </p>
      </div>
      <div className="space-y-2 lg:space-y-3">
        {certifications.length === 0 ? (
          <div className="border border-dashed rounded-xl border-customGray p-16">
            <p className="text-primary text-center whitespace-nowrap">
              No Certifications added
            </p>
          </div>
        ) : (
          certifications.map((certification, index) => (
            <div
              key={index}
              className="space-y-2 border border-customGray lg:px-5 lg:pb-5 rounded-lg"
            >
              <div className="border border-x-0 border-t-0 px-5 lg:px-10 lg:py-5 py-2">
                <div className="flex items-center justify-end">
                  <EditButton onClick={() => onEditCertification(index)} />
                  <DeleteButton onClick={() => onDeleteCertification(index)} />
                </div>
                <div className="flex w-full space-x-5 lg:space-x-10">
                  <div className="flex-shrink-0">
                    <img
                      src={certificationPic}
                      className="w-12 h-12"
                      alt="Certification"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-full space-y-1 lg:space-y-3">
                    <div className="text-lg text-primary font-medium">
                      <p>{certification.certificationTitle}</p>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:space-x-5 text-sm lg:text-base">
                      <div className="flex text-primary space-x-2 lg:space-x-5">
                        <p>
                          {new Date(
                            certification.startDate
                          ).toLocaleDateString()}
                        </p>
                        <p>-</p>
                        <p>
                          {certification.endDate
                            ? new Date(
                                certification.endDate
                              ).toLocaleDateString()
                            : "Present"}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-primary items-center gap-1">
                      <img src={link} alt="link" className="w-4 h-4" />
                      <a
                        href={certification.certificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-purpleText no-underline"
                        loading="lazy"
                      >
                        Certification URL
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Button
  onClick={() => {
    onAddCertification();
    onEditCertification(null);
  }}
  className="my-3 lg:my-5 text-lg font-semibold text-primary hover:text-purpleText"
>
  + Add Work Certifications
</Button>

    </div>
  );
};

export default AddCertificateResume;
