import linkedimImage from "../../../../assets/dashboardIcons/linkedinImage.svg"
import indeedimImage from "../../../../assets/dashboardIcons/indeedImage.svg"
import ziprecruiterImage from "../../../../assets/dashboardIcons/ziprecruiterImage.svg"
import glassdoorImage from "../../../../assets/dashboardIcons/glassdoorImage.svg"
import monsterImage from "../../../../assets/dashboardIcons/monsterImage.svg"
import SimplyHiredImage from "../../../../assets/dashboardIcons/simplyHiredImage.svg"

import PlatformActivation from "../../ui/PlatformActivation"

function IntegratedPlatforms() {
  const platformData = [
    {
      logo: linkedimImage,
      platformName: "LinkedIn",
      jobCount: "120 Jobs showing",
      infoList: [
        "740 million members with over 55 million registered companies.",
        "The largest social network of professional networking and career development.",
        "Make sure you have a complete profile along with a resume uploaded before start applying.",
        "Make sure you are logged in to Linkedin before you start applying.",
      ],
    },
    {
      logo: indeedimImage,
      platformName: "Indeed",
      jobCount: "150 Jobs showing",
      infoList: [
        "Over 16 million postings and 8.2 jobs are posted every second.",
        "Indeed is the most popular job posting site in the world.",
        "Make sure you have a complete profile along with a resume uploaded, before start applying.",
        "Make sure you are logged in to Indeed before you start applying.",
      ],
    },
    {
      logo: ziprecruiterImage,
      platformName: "ZipRecruiter",
      jobCount: "100 Jobs showing",
      infoList: [
        "110M+ job seekers have used ZipRecruiter.",
        "#1 rated hiring site in the U.S.",
        "Make sure you have a complete profile along with a resume uploaded, before start applying.",
        "Make sure you are logged in to Ziprecruiter before you start applying.",
      ],
    },
    {
      logo: glassdoorImage,
      platformName: "Dice",
      jobCount: "80 Jobs showing",
      infoList: [
        "Search 70000+ job openings from tech's hottest employers.",
        "Over 6.1 million tech professionals.",
        "Tech Professional Visits: Around 1.7 million visits per month.",
        "Make sure you are logged in to Dice before you start applying.",
      ],
    },
    {
      logo: monsterImage,
      platformName: "Monster",
      jobCount: "60 Jobs showing",
      infoList: [
        "Monster serves a global community of millions, championing workplace transparency since 2007.",
        "Over 55 million unique monthly visitors rely on Monster for valuable insights.",
        "Monster partners with 2.5 million employer clients, connecting them with talented professionals worldwide.",
      ],
    },
    {
      logo: SimplyHiredImage,
      platformName: "SimplyHired",
      jobCount: "90 Jobs showing",
      infoList: [
        "Simply Hired lists job openings from 700,000 unique employers.",
        "The platform operates job search engines in 24 countries and 12 languages.",
        `For the past 3 years, Simply Hired has been named a "Top job search website" by Forbes and PC Magazine.`,
      ],
    },
  ]

  return (
    <section
    data-tour="integrated-platforms-block"     // ✅ yahi target hoga
    className="flex flex-col gap-4 mt-10 mb-8"
    style={{ scrollMarginTop: 100 }}            // sticky header offset
  >

      <p className="text-2xl font-semibold">Integrated Platforms</p>

      <div className="flex flex-wrap bg-black/30 p-4 rounded-lg !text-white">
        {platformData.map((platform, index) => (
          <div key={index} className="flex p-4 w-full md:w-1/2 lg:w-1/3">
            <PlatformActivation
              logo={platform.logo}
              platformName={platform.platformName}
              infoList={platform.infoList}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default IntegratedPlatforms
