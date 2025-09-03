import React from "react";
import FeedbackCard from "../../../../components/feedbackCards";

const users = [
  {
    description:
      "I love building user-friendly web apps with a focus on performance.",
    userImage: "https://randomuser.me/api/portraits/men/1.jpg",
    userEmail: "john.doe@example.com",
    userName: "John Doe",
  },
  {
    description:
      "Specialized in backend development and creating scalable systems. Specialized in backend development and creating scalable systems.",
    userImage: "https://randomuser.me/api/portraits/women/2.jpg",
    userEmail: "jane.smith@example.com",
    userName: "Jane Smith",
  },
  {
    description: "Passionate about mobile app development and UI/UX design.",
    userImage: "https://randomuser.me/api/portraits/men/3.jpg",
    userEmail: "michael.jordan@example.com",
    userName: "Michael Jordan",
  },
  {
    description:
      "I work on AI and machine learning solutions to solve complex problems.",
    userImage: "https://randomuser.me/api/portraits/women/4.jpg",
    userEmail: "lisa.williams@example.com",
    userName: "Lisa Williams",
  },
  {
    description:
      "An enthusiastic data analyst who loves uncovering patterns from large datasets to drive decision-making. I'm always looking for new challenges to improve business intelligence.",
    userImage: "https://randomuser.me/api/portraits/men/5.jpg",
    userEmail: "david.brown@example.com",
    userName: "David Brown",
  },
  {
    description:
      "I have a deep passion for cybersecurity and ensuring networks are secure from potential threats.",
    userImage: "https://randomuser.me/api/portraits/women/6.jpg",
    userEmail: "emma.jones@example.com",
    userName: "Emma Jones",
  },
  {
    description:
      "A seasoned project manager with over 10 years of experience. I specialize in leading cross-functional teams to deliver results efficiently and on time.",
    userImage: "https://randomuser.me/api/portraits/men/7.jpg",
    userEmail: "mark.johnson@example.com",
    userName: "Mark Johnson",
  },
  {
    description:
      "Front-end developer passionate about creating seamless user experiences. Expertise in HTML, CSS, JavaScript, and React.",
    userImage: "https://randomuser.me/api/portraits/women/8.jpg",
    userEmail: "karen.white@example.com",
    userName: "Karen White",
  },
  {
    description:
      "Full-stack developer with a knack for problem-solving and a love for clean code. Always eager to learn new technologies and frameworks.",
    userImage: "https://randomuser.me/api/portraits/men/9.jpg",
    userEmail: "robert.taylor@example.com",
    userName: "Robert Taylor",
  },
  {
    description:
      "Machine learning enthusiast focused on building intelligent systems that can make predictions and solve real-world problems.",
    userImage: "https://randomuser.me/api/portraits/women/10.jpg",
    userEmail: "julia.martin@example.com",
    userName: "Julia Martin",
  },
  {
    description:
      "UX/UI designer focused on creating user-centric interfaces. I believe that design should be intuitive and visually appealing, ensuring a great user journey.",
    userImage: "https://randomuser.me/api/portraits/men/11.jpg",
    userEmail: "frank.thomas@example.com",
    userName: "Frank Thomas",
  },
  {
    description:
      "Cloud architect with experience in designing scalable cloud solutions for enterprise clients. Specializing in AWS and Azure.",
    userImage: "https://randomuser.me/api/portraits/women/12.jpg",
    userEmail: "laura.jackson@example.com",
    userName: "Laura Jackson",
  },
  {
    description:
      "Tech entrepreneur with a focus on building sustainable and innovative tech startups. My goal is to revolutionize industries with cutting-edge technology.",
    userImage: "https://randomuser.me/api/portraits/men/13.jpg",
    userEmail: "steve.evans@example.com",
    userName: "Steve Evans",
  },
  {
    description:
      "Data scientist specializing in machine learning algorithms, predictive modeling, and big data analysis to help businesses make data-driven decisions.",
    userImage: "https://randomuser.me/api/portraits/women/14.jpg",
    userEmail: "susan.morris@example.com",
    userName: "Susan Morris",
  },
  {
    description:
      "Mobile app developer with experience in both Android and iOS platforms. I love building responsive and user-friendly apps that engage users.",
    userImage: "https://randomuser.me/api/portraits/men/15.jpg",
    userEmail: "paul.wilson@example.com",
    userName: "Paul Wilson",
  },
];
// Helper function to split users array into chunks for columns
const chunkArray = (arr, chunkSize) => {
  let result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, chunkSize + i));
  }
  return result;
};

const FeedBackSection = () => {
  const columns = chunkArray(users, Math.ceil(users.length / 4));
  return (
    <>
      <div className="bg-almostBlack mt-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="mx-[10%]">
            <div className="pt-24 pb-16">
              <p className="text-primary text-4xl font-semibold text-center">
                <span className="text-[#A047F9]">Robo</span> <span className="text-[#FFC107]">Apply</span> Jobs is built on feedback from industry experts like
                you.
              </p>
              <div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-2  h-[900px]  lg:grid-cols-4 gap-6  pb-6 mt-16 mb-10 bg-almostBlack overflow-y-auto"
                  style={{
                    scrollbarWidth: "none", // Hide scrollbar in Firefox
                    msOverflowStyle: "none", // Hide scrollbar in IE
                    boxShadow: "inset 0 -100px 50px -30px rgba(0, 0, 0, 0.5)", // Shadow only on the bottom
                  }}
                >
                  {columns.map((column, columnIndex) => (
                    <FeedbackCard key={columnIndex} column={column} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedBackSection;
