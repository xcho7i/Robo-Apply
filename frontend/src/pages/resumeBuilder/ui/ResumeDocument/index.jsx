// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DashboardNavbar from "../../../dashboardNavbar";
// import Button from "../../../components/Button";
// import { HiArrowLeft } from "react-icons/hi";
// import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
// import ResumeDocument from "../ui/ResumeDocument";

// const ShowResume = () => {
//   const navigate = useNavigate();
//   const [resumeData, setResumeData] = useState(null);
//   const [pdfBlobUrl, setPdfBlobUrl] = useState("");

//   useEffect(() => {
//     // Get data from localStorage
//     const storedSkills =
//       JSON.parse(localStorage.getItem("resumeBuilderSkills")) || [];
//     const storedAchievements =
//       JSON.parse(localStorage.getItem("resumeBuilderAchievements")) || [];
//     const storedLanguages =
//       JSON.parse(localStorage.getItem("resumeBuilderLanguages")) || [];
//     const storedCertifications =
//       JSON.parse(localStorage.getItem("resumeBuilderCertifications")) || [];
//     const storedExperiences =
//       JSON.parse(localStorage.getItem("resumeBuilderExperiences")) || [];
//     const storedQualifications =
//       JSON.parse(localStorage.getItem("resumeBuilderQualifications")) || [];
//     const storedPersonalData =
//       JSON.parse(localStorage.getItem("resumeBuilderPersonalData")) || {};
//     const resumeTitle = localStorage.getItem("resumeTitle") || "My Resume";

//     const data = {
//       skills: storedSkills,
//       achievements: storedAchievements,
//       languages: storedLanguages,
//       certifications: storedCertifications,
//       experiences: storedExperiences,
//       qualifications: storedQualifications,
//       personalData: storedPersonalData,
//       resumeTitle,
//     };

//     setResumeData(data);

//     // Generate PDF and convert it to Blob URL
//     const generatePdf = async () => {
//       const blob = await pdf(<ResumeDocument data={data} />).toBlob();
//       const url = URL.createObjectURL(blob);
//       setPdfBlobUrl(url);
//     };

//     generatePdf();
//   }, []);

//   return (
//     <div className="flex flex-col bg-almostBlack">
//       <header>
//         <DashboardNavbar />
//       </header>
//       <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
//         <div className="w-full">
//           <div className="w-full p-10">
//             <div className="flex items-center justify-between px-20">
//               <p className="text-primary text-3xl font-medium">
//                 AI ResumeBuilder
//               </p>
//               <Button
//                 onClick={() =>
//                   navigate("/scan-resume/chooseTemplateCreateResume")
//                 }
//                 className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//               >
//                 <HiArrowLeft className="mr-2" />
//                 Go Back
//               </Button>
//             </div>
//           </div>

//           <div className="flex flex-col items-center justify-center h-full">
//             <div className="py-10 px-10 w-full rounded-lg text-center space-y-5">
//               <p className="text-primary text-4xl font-medium">
//                 Your Resume Preview
//               </p>
//               <p className="text-lightestGrey text-2xl font-normal pt-2 pb-5">
//                 Here’s a preview of your resume based on the information you
//                 provided.
//               </p>
//             </div>

//             {/* PDF Preview Section */}
//             <div className="w-[48%] h-[100vh]">
//               {pdfBlobUrl ? (
//                 <iframe
//                   src={pdfBlobUrl}
//                   title="Resume PDF"
//                   className="w-full h-full"
//                   style={{ border: "none" }}
//                 ></iframe>
//               ) : (
//                 <p className="text-primary text-center mt-10">
//                   Loading PDF Preview...
//                 </p>
//               )}
//             </div>

//             <div className="flex items-center p-10 justify-center space-x-10">
//               <Button
//                 onClick={() => navigate("/scan-resume")}
//                 className="p-3 flex items-center space-x-2 w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//               >
//                 Reset resume & start over
//               </Button>
//               <PDFDownloadLink
//                 document={<ResumeDocument data={resumeData} />}
//                 fileName="resume.pdf"
//                 className="p-3 flex items-center space-x-2 w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//               >
//                 {({ loading }) =>
//                   loading ? "Loading Document..." : "Download PDF"
//                 }
//               </PDFDownloadLink>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShowResume;

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Define styles for the PDF layout
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  content: {
    fontSize: 12,
    marginTop: 5,
    lineHeight: 1.5,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  personalInfoContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  personalInfoItem: {
    width: "45%",
  },
  box: {
    marginBottom: 30,
    padding: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    borderBottom: "1px solid #ccc",
    paddingBottom: 5,
  },
  contentList: {
    marginLeft: 10,
  },
  contentListItem: {
    fontSize: 12,
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
  },
});

const ResumeDocument = ({ data }) => {
  const {
    skills = [],
    achievements = [],
    languages = [],
    certifications = [],
    experiences = [],
    qualifications = [],
    personalData = {},
    resumeTitle = "",
  } = data || {};

  return (
    <Document>
      <Page style={styles.page} size="A4" wrap>
        {/* Resume Title */}
        <Text style={styles.title}>{resumeTitle}</Text>

        {/* Personal Information */}
        <View style={styles.personalInfoContainer}>
          <View style={styles.personalInfoItem}>
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.content}>
              <strong>Name:</strong> {personalData.name}
            </Text>
            <Text style={styles.content}>
              <strong>Job Title:</strong> {personalData.jobTitle}
            </Text>
            <Text style={styles.content}>
              <strong>Email:</strong> {personalData.email}
            </Text>
            <Text style={styles.content}>
              <strong>Phone:</strong> {personalData.phone}
            </Text>
            <Text style={styles.content}>
              <strong>LinkedIn:</strong> {personalData.linkedin}
            </Text>
            <Text style={styles.content}>
              <strong>Website:</strong> {personalData.website}
            </Text>
          </View>
          <View style={styles.personalInfoItem}>
            <Text style={styles.title}>Address</Text>
            <Text style={styles.content}>
              <strong>Street:</strong> {personalData.address}
            </Text>
            <Text style={styles.content}>
              <strong>City:</strong> {personalData.city}
            </Text>
            <Text style={styles.content}>
              <strong>State:</strong> {personalData.state}
            </Text>
            <Text style={styles.content}>
              <strong>State:</strong> {personalData.state}
            </Text>
            <Text style={styles.content}>
              <strong>Postal Code:</strong> {personalData.postalCode}
            </Text>
            <Text style={styles.content}>
              <strong>Country:</strong> {personalData.country}
            </Text>
          </View>
        </View>
        <View style={styles.box}>
          <Text style={styles.content}>
            <strong>Summary:</strong> {personalData.summary}
          </Text>
        </View>
        {/* Skills Section */}
        <View style={styles.box}>
          <Text style={styles.sectionHeader}>Skills</Text>
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <Text key={index} style={styles.contentListItem}>
                - {skill.skill} ({skill.yearsOfExperience} years)
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No skills listed</Text>
          )}
        </View>

        {/* Achievements Section */}
        <View style={styles.box}>
          <Text style={styles.sectionHeader}>Achievements</Text>
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <Text key={index} style={styles.contentListItem}>
                - {achievement.awardTitle} ({achievement.startDate} -{" "}
                {achievement.endDate})
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No achievements listed</Text>
          )}
        </View>

        {/* Certifications Section */}
        <View style={styles.box}>
          <Text style={styles.sectionHeader}>Certifications</Text>
          {certifications.length > 0 ? (
            certifications.map((certification, index) => (
              <Text key={index} style={styles.contentListItem}>
                - {certification.certificationTitle} ({certification.startDate}{" "}
                - {certification.endDate})
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No certifications listed</Text>
          )}
        </View>

        {/* Experience Section */}
        <View style={styles.box}>
          <Text style={styles.sectionHeader}>Experience</Text>
          {experiences.length > 0 ? (
            experiences.map((experience, index) => (
              <Text key={index} style={styles.contentListItem}>
                - {experience.jobTitle} at {experience.companyName} (
                {experience.startDate} - {experience.endDate})
                <Text style={styles.content}>
                  Location: {experience.location}
                </Text>
                <Text style={styles.content}>
                  Description: {experience.description}
                </Text>
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No experience listed</Text>
          )}
        </View>

        {/* Languages Section */}
        <View style={styles.box}>
          <Text style={styles.sectionHeader}>Languages</Text>
          {languages.length > 0 ? (
            languages.map((language, index) => (
              <Text key={index} style={styles.contentListItem}>
                - {language.language} ({language.proficiency})
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No languages listed</Text>
          )}
        </View>

        {/* Qualifications Section */}
        <View style={styles.box}>
          <Text style={styles.sectionHeader}>Qualifications</Text>
          {qualifications.length > 0 ? (
            qualifications.map((qualification, index) => (
              <Text key={index} style={styles.contentListItem}>
                - {qualification.degreeType} in {qualification.major} from{" "}
                {qualification.institutionName} ({qualification.startDate} -{" "}
                {qualification.endDate})
                <Text style={styles.content}>GPA: {qualification.gpa}</Text>
                <Text style={styles.content}>
                  Institution: {qualification.institutionName},{" "}
                  {qualification.institutionCity},{" "}
                  {qualification.institutionState}
                </Text>
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No qualifications listed</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Generated by AI Resume Builder</Text>
      </Page>
    </Document>
  );
};

export default ResumeDocument;
