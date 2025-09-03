// //1st file
// /** @type {import('tailwindcss').Config} */

// const { purple } = require("@mui/material/colors")
// const { dark } = require("@mui/material/styles/createPalette")

// module.exports = {
//   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {
//       fontSize: {
//         normal: "16px",
//         navbar: "16px",
//         large: "48px"
//       },
//       colors: {
//         primary: "rgba(255, 255, 255, 1)",
//         secondary: "rgba(233, 226, 255, 1)",
//         primaryBackground: "rgba(16, 9, 25, 1)",
//         gradientStart: "#AF63FB",
//         gradientEnd: "#8C20F8",
//         greenColor: "rgba(38, 171, 95, 1)",
//         purple: "rgba(166, 82, 250, 1)",
//         // Yellow color for the free trial component
//         yellow: "rgba(255, 193, 7, 1)",
//         // Custom purple variants for better contrast on dark backgrounds
//         custompurple: {
//           100: "rgba(250, 245, 255, 1)", // Very light purple - highest contrast
//           200: "rgba(243, 232, 255, 1)", // Light purple - very high contrast
//           300: "rgba(221, 214, 254, 1)", // Medium light purple - excellent contrast
//           400: "rgba(196, 181, 253, 1)", // Medium purple - good contrast
//           500: "rgba(167, 139, 250, 1)", // Base purple - medium contrast
//           600: "rgba(147, 51, 234, 1)", // Darker purple
//           700: "rgba(126, 34, 206, 1)", // Dark purple
//           800: "rgba(88, 28, 135, 1)", // Very dark purple
//           900: "rgba(59, 7, 100, 1)" // Darkest purple
//         },
//         ProgressBarText: "rgba(171, 136, 251, 1)",
//         ProgressBarColor: "rgba(255, 193, 7, 1)",
//         // Additional gray shades for the component
//         gray: {
//           50: "#f9fafb",
//           100: "#f3f4f6",
//           200: "#e5e7eb",
//           300: "#d1d5db",
//           400: "#9ca3af",
//           500: "#6b7280",
//           600: "#4b5563",
//           700: "#374151",
//           800: "#1f2937",
//           900: "#111827"
//         }
//       },
//       fontWeight: {
//         normal: "400",
//         bold: "700"
//       },
//       screens: {
//         xs: "480px",
//         sm: "640px", // Small devices (landscape phones, 576px and up)
//         md: "768px", // Medium devices (tablets, 768px and up)
//         lg: "1024px", // Large devices (desktops, 1024px and up)
//         xl: "1280px" // Extra large devices (large desktops, 1280px and up)
//       },
//       borderRadius: {
//         full: "100px",
//         feedbackCardRadius: "24px, 24px, 24px, 4px"
//       },
//       textColor: {
//         primary: "rgba(255, 255, 255, 1)",
//         black: "rgba(0, 0, 0, 1)",
//         secondary: "rgba(233, 226, 255, 1)",
//         lightGrey: "rgba(255, 255, 255, 0.48)",
//         greyColor: "rgba(255, 255, 255, 0.8)",
//         extraLightGrey: "rgba(188, 188, 188, 1)",
//         lightestGrey: "rgba(212, 212, 212, 1)",
//         faqAnsColor: "rgba(254, 254, 254, 0.8)",
//         purpleColor: "rgba(166, 82, 250, 1)",
//         blackColor: "rgba(42, 42, 42, 1)",
//         profileNameColor: "rgba(224, 224, 224, 1)",
//         profileEmailColor: "rgba(94, 110, 120, 1)",
//         ProgressBarText: "rgba(171, 136, 251, 1)",
//         ProgressBarColor: "rgba(255, 193, 7, 1)",
//         placeHolderColor: "rgba(255, 255, 255, 0.5)",
//         jobSeekersColor: "rgba(255, 255, 255, 0.64)",
//         lightPurple: "rgba(44, 33, 54, 1)",
//         prupleText: "rgba(140, 32, 248, 1)",
//         danger: "rgba(255, 115, 115, 1)",
//         tickPurle: "rgba(175, 99, 251, 1)",
//         redColor: "rgb(255, 0, 0)",
//         yellowColor: "rgba(255, 193, 7, 1)",
//         lightGrey: "rgba(193, 193, 193, 1)"
//       },
//       backgroundColor: {
//         purpleBackground: "rgba(166, 82, 250, 1)",
//         modalPurple: "rgba(54, 37, 71, 1)",
//         lightestGrey: "rgba(212, 212, 212, 1)",
//         purple: "rgba(130, 29, 182, 1)",
//         tablePurple: "rgba(159, 95, 227, 1)",
//         darkPurple: "rgba(61, 40, 82, 0.5)",
//         glass: "rgb(255, 255, 255, 0.04)",
//         lightBackground: "rgba(255, 255, 255, 0.1)",
//         lightGreyBackground: "rgba(255, 255, 255, 0.1)",
//         darkestPurple: "rgba(77, 39, 115, 1)",
//         almostBlack: "rgba(26, 26, 26, 1)",
//         totalBlack: "rgba(19, 19, 19, 1)",
//         faqBackground: "rgba(254, 254, 254, 0.07)",
//         inputBackGround: "rgba(69, 69, 69, 1)",
//         whiteBackground: "rgba(255, 255, 255, 1)",
//         dropdownBackground: "rgba(251, 251, 251, 0.08)",
//         multipleDropdownBackground: "rgba(45, 45, 45)",
//         cardBgColor: "rgba(27, 21, 37, 1)",
//         lightPurple: "rgba(44, 33, 54, 1)",
//         green: "rgba(0, 127, 0, 1)",
//         yellow: "rgba(255, 193, 7, 1)",
//         blue: "rgba(0, 123, 255, 1)",
//         red: "rgb(255, 0, 0)",
//         dangerColor: "rgba(240, 160, 160, 1)",
//         resumeTemplateBackground: "rgba(155, 61, 249, 0.5)",
//         stepperBackground: "rgba(158, 66, 249, 1)",
//         analyticsBoxBackground: "rgba(44, 44, 44, 1);",
//         pricingLightPurple: "rgba(133, 58, 204, 0.058823529411764705)"
//       },
//       borderColor: {
//         customGray: "rgba(114, 114, 114, 1)",
//         customPurple: "rgba(130, 29, 182, 1)",
//         dashboardborderColor: "rgba(161, 161, 161, 0.2)",
//         formBorders: "rgba(69, 69, 69, 1)",
//         simplePurple: "rgba(166, 82, 250, 1)",
//         purpleBorder: "rgba(140, 32, 248, 1)",
//         almostBlackBorder: "rgba(26, 26, 26, 1)",
//         dangerBorder: "rgba(240, 160, 160, 1)",
//         stepperBackground: "rgba(158, 66, 249, 1)",
//         yellow: "rgba(255, 193, 7, 1)",
//         yellowColor: "rgba(255, 193, 7, 1)",
//         PricingLeftBorder: "rgba(133, 58, 204, 0.18823529411764706)"
//       }
//     }
//   },
//   plugins: [
//     require("@tailwindcss/forms"),
//     function ({ addUtilities }) {
//       addUtilities({
//         ".hide-scrollbar": {
//           /* Hide the scrollbar */
//           "&::-webkit-scrollbar": {
//             display: "none"
//           },
//           "&": {
//             "-ms-overflow-style": "none" /* IE and Edge */,
//             "scrollbar-width": "none" /* Firefox */
//           }
//         }
//       })
//     }
//   ]
// }

// Updated file with all missing elements from 2nd file
/** @type {import('tailwindcss').Config} */

// const { purple } = require("@mui/material/colors");
// const { dark } = require("@mui/material/styles/createPalette");
import { purple } from "@mui/material/colors"
import { dark } from "@mui/material/styles/createPalette"

const colors = require("tailwindcss/colors")

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        normal: "16px",
        navbar: "16px",
        large: "48px"
      },
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        primaryBackground: "rgba(16, 9, 25, 1)",
        gradientStart: "#AF63FB",
        gradientEnd: "#8C20F8",
        greenColor: "rgba(38, 171, 95, 1)",
        purple: "rgba(166, 82, 250, 1)",
        // Yellow color for the free trial component
        yellow: "rgba(255, 193, 7, 1)",
        yellowTailwind: colors.yellow,
        // Custom purple variants for better contrast on dark backgrounds
        custompurple: {
          100: "rgba(250, 245, 255, 1)", // Very light purple - highest contrast
          200: "rgba(243, 232, 255, 1)", // Light purple - very high contrast
          300: "rgba(221, 214, 254, 1)", // Medium light purple - excellent contrast
          400: "rgba(196, 181, 253, 1)", // Medium purple - good contrast
          500: "rgba(167, 139, 250, 1)", // Base purple - medium contrast
          600: "rgba(147, 51, 234, 1)", // Darker purple
          700: "rgba(126, 34, 206, 1)", // Dark purple
          800: "rgba(88, 28, 135, 1)", // Very dark purple
          900: "rgba(59, 7, 100, 1)" // Darkest purple
        },
        ProgressBarText: "rgba(171, 136, 251, 1)",
        ProgressBarColor: "rgba(255, 193, 7, 1)",
        // Additional gray shades for the component
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827"
        },
        "brand-yellow": "var(--brand-yellow)",
        "brand-purple": "var(--brand-purple)",
        "brand-purple-dark": "var(--brand-purple-dark)",
        "brand-bgBlue": "var(--brand-bgBlue)",
        "brand-bgBlue-form": "var(--brand-bgBlue-form)",
        "brand-bgBlue-form-input": "var(--brand-bgBlue-form-input)",
        "brand-bgBlue-form-input-border":
          "var(--brand-bgBlue-form-input-border)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))"
        }
      },
      fontWeight: {
        normal: "400",
        bold: "700"
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px"
      },
      borderRadius: {
        full: "100px",
        feedbackCardRadius: "24px, 24px, 24px, 4px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      textColor: {
        primary: "rgba(255, 255, 255, 1)",

        black: "rgba(0, 0, 0, 1)",
        secondary: "rgba(233, 226, 255, 1)",
        lightGrey: "rgba(193, 193, 193, 1)",
        greyColor: "rgba(255, 255, 255, 0.8)",
        extraLightGrey: "rgba(188, 188, 188, 1)",
        lightestGrey: "rgba(212, 212, 212, 1)",
        faqAnsColor: "rgba(254, 254, 254, 0.8)",
        purpleColor: "rgba(166, 82, 250, 1)",
        blackColor: "rgba(42, 42, 42, 1)",
        profileNameColor: "rgba(224, 224, 224, 1)",
        profileEmailColor: "rgba(94, 110, 120, 1)",
        ProgressBarText: "rgba(171, 136, 251, 1)",
        ProgressBarColor: "rgba(255, 193, 7, 1)",
        placeHolderColor: "rgba(255, 255, 255, 0.5)",
        jobSeekersColor: "rgba(255, 255, 255, 0.64)",
        lightPurple: "rgba(44, 33, 54, 1)",
        prupleText: "rgba(140, 32, 248, 1)",
        danger: "rgba(255, 115, 115, 1)",
        tickPurle: "rgba(175, 99, 251, 1)",
        redColor: "rgb(255, 0, 0)",
        yellowColor: "rgba(255, 193, 7, 1)"
      },
      backgroundColor: {
        purpleBackground: "rgba(166, 82, 250, 1)",
        modalPurple: "rgba(54, 37, 71, 1)",
        lightestGrey: "rgba(212, 212, 212, 1)",
        purple: "rgba(130, 29, 182, 1)",
        tablePurple: "rgba(159, 95, 227, 1)",
        darkPurple: "rgba(61, 40, 82, 0.5)",
        glass: "rgb(255, 255, 255, 0.04)",
        lightBackground: "rgba(255, 255, 255, 0.1)",
        lightGreyBackground: "rgba(255, 255, 255, 0.1)",
        darkestPurple: "rgba(77, 39, 115, 1)",
        almostBlack: "rgba(26, 26, 26, 1)",
        totalBlack: "rgba(19, 19, 19, 1)",
        faqBackground: "rgba(254, 254, 254, 0.07)",
        inputBackGround: "rgba(69, 69, 69, 1)",
        whiteBackground: "rgba(255, 255, 255, 1)",
        dropdownBackground: "rgba(251, 251, 251, 0.08)",
        multipleDropdownBackground: "rgba(45, 45, 45)",
        cardBgColor: "rgba(27, 21, 37, 1)",
        lightPurple: "rgba(44, 33, 54, 1)",
        green: "rgba(0, 127, 0, 1)",
        yellow: "rgba(255, 193, 7, 1)",
        blue: "rgba(0, 123, 255, 1)",
        red: "rgb(255, 0, 0)",
        dangerColor: "rgba(240, 160, 160, 1)",
        resumeTemplateBackground: "rgba(155, 61, 249, 0.5)",
        stepperBackground: "rgba(158, 66, 249, 1)",
        analyticsBoxBackground: "rgba(44, 44, 44, 1);",
        pricingLightPurple: "rgba(133, 58, 204, 0.058823529411764705)",
        primary: "rgba(255, 255, 255, 1)"
      },
      borderColor: {
        primary: "rgba(140, 32, 248, 1)",
        customGray: "rgba(114, 114, 114, 1)",
        customPurple: "rgba(130, 29, 182, 1)",
        dashboardborderColor: "rgba(161, 161, 161, 0.2)",
        formBorders: "rgba(69, 69, 69, 1)",
        simplePurple: "rgba(166, 82, 250, 1)",
        purpleBorder: "rgba(140, 32, 248, 1)",
        almostBlackBorder: "rgba(26, 26, 26, 1)",
        dangerBorder: "rgba(240, 160, 160, 1)",
        stepperBackground: "rgba(158, 66, 249, 1)",
        yellow: "rgba(255, 193, 7, 1)",
        yellowColor: "rgba(255, 193, 7, 1)",
        PricingLeftBorder: "rgba(133, 58, 204, 0.18823529411764706)"
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none"
          }
        }
      }
      addUtilities(newUtilities)
    }
    // function ({ addUtilities }) {
    //   addUtilities({
    //     ".hide-scrollbar": {
    //       /* Hide the scrollbar */
    //       "&::-webkit-scrollbar": {
    //         display: "none"
    //       },
    //       "&": {
    //         "-ms-overflow-style": "none" /* IE and Edge */,
    //         "scrollbar-width": "none" /* Firefox */
    //       }
    //     }
    //   })
    // },
    // require("tailwindcss-animate")
  ]
}
