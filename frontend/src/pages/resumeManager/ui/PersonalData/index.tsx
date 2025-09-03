import React from "react"
import Select from "react-select"
import SimpleInputField from "../../../../components/SimpleInputFields"
import InputItem from "../InputItem"
import SelectItem from "../SelectItem"
import { Resume } from "@types"
import { countries, getCountryData, getEmojiFlag } from "@/src/utils"

interface Props {
  personalInformation: Resume["personalInformation"]
  errors: Resume["personalInformation"]
  nameError: { firstName: string; lastName: string }
  onChange: (key: keyof Resume["personalInformation"], value: string) => void
}

const PersonalData = ({
  personalInformation,
  onChange,
  errors,
  nameError
}: Props) => {
  const countryCodes = [
    { code: "+7", country: "GE", flagUrl: "https://flagcdn.com/ge.svg" }, // Abkhazia (uses Georgia)
    { code: "+93", country: "AF", flagUrl: "https://flagcdn.com/af.svg" }, // Afghanistan
    { code: "+358", country: "AX", flagUrl: "https://flagcdn.com/ax.svg" }, // Åland
    { code: "+355", country: "AL", flagUrl: "https://flagcdn.com/al.svg" }, // Albania
    { code: "+213", country: "DZ", flagUrl: "https://flagcdn.com/dz.svg" }, // Algeria
    { code: "+1", country: "AS", flagUrl: "https://flagcdn.com/as.svg" }, // American Samoa
    { code: "+376", country: "AD", flagUrl: "https://flagcdn.com/ad.svg" }, // Andorra
    { code: "+244", country: "AO", flagUrl: "https://flagcdn.com/ao.svg" }, // Angola
    { code: "+1", country: "AI", flagUrl: "https://flagcdn.com/ai.svg" }, // Anguilla
    { code: "+1", country: "AG", flagUrl: "https://flagcdn.com/ag.svg" }, // Antigua and Barbuda
    { code: "+54", country: "AR", flagUrl: "https://flagcdn.com/ar.svg" }, // Argentina
    { code: "+374", country: "AM", flagUrl: "https://flagcdn.com/am.svg" }, // Armenia
    { code: "+297", country: "AW", flagUrl: "https://flagcdn.com/aw.svg" }, // Aruba
    { code: "+247", country: "AC", flagUrl: "https://flagcdn.com/ac.svg" }, // Ascension
    { code: "+61", country: "AU", flagUrl: "https://flagcdn.com/au.svg" }, // Australia
    { code: "+43", country: "AT", flagUrl: "https://flagcdn.com/at.svg" }, // Austria
    { code: "+994", country: "AZ", flagUrl: "https://flagcdn.com/az.svg" }, // Azerbaijan
    { code: "+1", country: "BS", flagUrl: "https://flagcdn.com/bs.svg" }, // Bahamas
    { code: "+973", country: "BH", flagUrl: "https://flagcdn.com/bh.svg" }, // Bahrain
    { code: "+880", country: "BD", flagUrl: "https://flagcdn.com/bd.svg" }, // Bangladesh
    { code: "+1", country: "BB", flagUrl: "https://flagcdn.com/bb.svg" }, // Barbados
    { code: "+375", country: "BY", flagUrl: "https://flagcdn.com/by.svg" }, // Belarus
    { code: "+32", country: "BE", flagUrl: "https://flagcdn.com/be.svg" }, // Belgium
    { code: "+501", country: "BZ", flagUrl: "https://flagcdn.com/bz.svg" }, // Belize
    { code: "+229", country: "BJ", flagUrl: "https://flagcdn.com/bj.svg" }, // Benin
    { code: "+1", country: "BM", flagUrl: "https://flagcdn.com/bm.svg" }, // Bermuda
    { code: "+975", country: "BT", flagUrl: "https://flagcdn.com/bt.svg" }, // Bhutan
    { code: "+591", country: "BO", flagUrl: "https://flagcdn.com/bo.svg" }, // Bolivia
    { code: "+599", country: "BQ", flagUrl: "https://flagcdn.com/bq.svg" }, // Bonaire
    { code: "+387", country: "BA", flagUrl: "https://flagcdn.com/ba.svg" }, // Bosnia and Herzegovina
    { code: "+267", country: "BW", flagUrl: "https://flagcdn.com/bw.svg" }, // Botswana
    { code: "+55", country: "BR", flagUrl: "https://flagcdn.com/br.svg" }, // Brazil
    { code: "+246", country: "IO", flagUrl: "https://flagcdn.com/io.svg" }, // British Indian Ocean Territory
    { code: "+1", country: "VG", flagUrl: "https://flagcdn.com/vg.svg" }, // British Virgin Islands
    { code: "+673", country: "BN", flagUrl: "https://flagcdn.com/bn.svg" }, // Brunei Darussalam
    { code: "+359", country: "BG", flagUrl: "https://flagcdn.com/bg.svg" }, // Bulgaria
    { code: "+226", country: "BF", flagUrl: "https://flagcdn.com/bf.svg" }, // Burkina Faso
    { code: "+257", country: "BI", flagUrl: "https://flagcdn.com/bi.svg" }, // Burundi
    { code: "+238", country: "CV", flagUrl: "https://flagcdn.com/cv.svg" }, // Cape Verde
    { code: "+855", country: "KH", flagUrl: "https://flagcdn.com/kh.svg" }, // Cambodia
    { code: "+237", country: "CM", flagUrl: "https://flagcdn.com/cm.svg" }, // Cameroon
    { code: "+1", country: "CA", flagUrl: "https://flagcdn.com/ca.svg" }, // Canada
    { code: "+599", country: "BQ", flagUrl: "https://flagcdn.com/bq.svg" }, // Caribbean Netherlands
    { code: "+1", country: "KY", flagUrl: "https://flagcdn.com/ky.svg" }, // Cayman Islands
    { code: "+236", country: "CF", flagUrl: "https://flagcdn.com/cf.svg" }, // Central African Republic
    { code: "+235", country: "TD", flagUrl: "https://flagcdn.com/td.svg" }, // Chad
    { code: "+56", country: "CL", flagUrl: "https://flagcdn.com/cl.svg" }, // Chile
    { code: "+86", country: "CN", flagUrl: "https://flagcdn.com/cn.svg" }, // China
    { code: "+61", country: "CX", flagUrl: "https://flagcdn.com/cx.svg" }, // Christmas Island
    { code: "+61", country: "CC", flagUrl: "https://flagcdn.com/cc.svg" }, // Cocos (Keeling) Islands
    { code: "+57", country: "CO", flagUrl: "https://flagcdn.com/co.svg" }, // Colombia
    { code: "+269", country: "KM", flagUrl: "https://flagcdn.com/km.svg" }, // Comoros
    { code: "+242", country: "CG", flagUrl: "https://flagcdn.com/cg.svg" }, // Congo
    { code: "+243", country: "CD", flagUrl: "https://flagcdn.com/cd.svg" }, // Congo, Democratic Republic of the
    { code: "+682", country: "CK", flagUrl: "https://flagcdn.com/ck.svg" }, // Cook Islands
    { code: "+506", country: "CR", flagUrl: "https://flagcdn.com/cr.svg" }, // Costa Rica
    { code: "+225", country: "CI", flagUrl: "https://flagcdn.com/ci.svg" }, // Ivory Coast (Côte d'Ivoire)
    { code: "+385", country: "HR", flagUrl: "https://flagcdn.com/hr.svg" }, // Croatia
    { code: "+53", country: "CU", flagUrl: "https://flagcdn.com/cu.svg" }, // Cuba
    { code: "+599", country: "CW", flagUrl: "https://flagcdn.com/cw.svg" }, // Curaçao
    { code: "+357", country: "CY", flagUrl: "https://flagcdn.com/cy.svg" }, // Cyprus
    { code: "+420", country: "CZ", flagUrl: "https://flagcdn.com/cz.svg" }, // Czech Republic
    { code: "+45", country: "DK", flagUrl: "https://flagcdn.com/dk.svg" }, // Denmark
    { code: "+253", country: "DJ", flagUrl: "https://flagcdn.com/dj.svg" }, // Djibouti
    { code: "+1", country: "DM", flagUrl: "https://flagcdn.com/dm.svg" }, // Dominica
    { code: "+1", country: "DO", flagUrl: "https://flagcdn.com/do.svg" }, // Dominican Republic
    { code: "+56", country: "CL", flagUrl: "https://flagcdn.com/cl.svg" }, // Easter Island (Chile)
    { code: "+593", country: "EC", flagUrl: "https://flagcdn.com/ec.svg" }, // Ecuador
    { code: "+20", country: "EG", flagUrl: "https://flagcdn.com/eg.svg" }, // Egypt
    { code: "+503", country: "SV", flagUrl: "https://flagcdn.com/sv.svg" }, // El Salvador
    { code: "+240", country: "GQ", flagUrl: "https://flagcdn.com/gq.svg" }, // Equatorial Guinea
    { code: "+291", country: "ER", flagUrl: "https://flagcdn.com/er.svg" }, // Eritrea
    { code: "+372", country: "EE", flagUrl: "https://flagcdn.com/ee.svg" }, // Estonia
    { code: "+268", country: "SZ", flagUrl: "https://flagcdn.com/sz.svg" }, // Eswatini
    { code: "+251", country: "ET", flagUrl: "https://flagcdn.com/et.svg" }, // Ethiopia
    { code: "+500", country: "FK", flagUrl: "https://flagcdn.com/fk.svg" }, // Falkland Islands
    { code: "+298", country: "FO", flagUrl: "https://flagcdn.com/fo.svg" }, // Faroe Islands
    { code: "+679", country: "FJ", flagUrl: "https://flagcdn.com/fj.svg" }, // Fiji
    { code: "+358", country: "FI", flagUrl: "https://flagcdn.com/fi.svg" }, // Finland
    { code: "+33", country: "FR", flagUrl: "https://flagcdn.com/fr.svg" }, // France
    { code: "+594", country: "GF", flagUrl: "https://flagcdn.com/gf.svg" }, // French Guiana
    { code: "+689", country: "PF", flagUrl: "https://flagcdn.com/pf.svg" }, // French Polynesia
    { code: "+241", country: "GA", flagUrl: "https://flagcdn.com/ga.svg" }, // Gabon
    { code: "+220", country: "GM", flagUrl: "https://flagcdn.com/gm.svg" }, // Gambia
    { code: "+995", country: "GE", flagUrl: "https://flagcdn.com/ge.svg" }, // Georgia
    { code: "+49", country: "DE", flagUrl: "https://flagcdn.com/de.svg" }, // Germany
    { code: "+233", country: "GH", flagUrl: "https://flagcdn.com/gh.svg" }, // Ghana
    { code: "+350", country: "GI", flagUrl: "https://flagcdn.com/gi.svg" }, // Gibraltar
    { code: "+30", country: "GR", flagUrl: "https://flagcdn.com/gr.svg" }, // Greece
    { code: "+299", country: "GL", flagUrl: "https://flagcdn.com/gl.svg" }, // Greenland
    { code: "+1", country: "GD", flagUrl: "https://flagcdn.com/gd.svg" }, // Grenada
    { code: "+590", country: "GP", flagUrl: "https://flagcdn.com/gp.svg" }, // Guadeloupe
    { code: "+1", country: "GU", flagUrl: "https://flagcdn.com/gu.svg" }, // Guam
    { code: "+502", country: "GT", flagUrl: "https://flagcdn.com/gt.svg" }, // Guatemala
    { code: "+44", country: "GG", flagUrl: "https://flagcdn.com/gg.svg" }, // Guernsey
    { code: "+224", country: "GN", flagUrl: "https://flagcdn.com/gn.svg" }, // Guinea
    { code: "+245", country: "GW", flagUrl: "https://flagcdn.com/gw.svg" }, // Guinea-Bissau
    { code: "+592", country: "GY", flagUrl: "https://flagcdn.com/gy.svg" }, // Guyana
    { code: "+509", country: "HT", flagUrl: "https://flagcdn.com/ht.svg" }, // Haiti
    { code: "+504", country: "HN", flagUrl: "https://flagcdn.com/hn.svg" }, // Honduras
    { code: "+852", country: "HK", flagUrl: "https://flagcdn.com/hk.svg" }, // Hong Kong
    { code: "+36", country: "HU", flagUrl: "https://flagcdn.com/hu.svg" }, // Hungary
    { code: "+354", country: "IS", flagUrl: "https://flagcdn.com/is.svg" }, // Iceland
    { code: "+91", country: "IN", flagUrl: "https://flagcdn.com/in.svg" }, // India
    { code: "+62", country: "ID", flagUrl: "https://flagcdn.com/id.svg" }, // Indonesia
    { code: "+98", country: "IR", flagUrl: "https://flagcdn.com/ir.svg" }, // Iran
    { code: "+964", country: "IQ", flagUrl: "https://flagcdn.com/iq.svg" }, // Iraq
    { code: "+353", country: "IE", flagUrl: "https://flagcdn.com/ie.svg" }, // Ireland
    { code: "+44", country: "IM", flagUrl: "https://flagcdn.com/im.svg" }, // Isle of Man
    { code: "+972", country: "IL", flagUrl: "https://flagcdn.com/il.svg" }, // Israel
    { code: "+39", country: "IT", flagUrl: "https://flagcdn.com/it.svg" }, // Italy
    { code: "+1", country: "JM", flagUrl: "https://flagcdn.com/jm.svg" }, // Jamaica
    { code: "+47", country: "SJ", flagUrl: "https://flagcdn.com/sj.svg" }, // Jan Mayen
    { code: "+81", country: "JP", flagUrl: "https://flagcdn.com/jp.svg" }, // Japan
    { code: "+44", country: "JE", flagUrl: "https://flagcdn.com/je.svg" }, // Jersey
    { code: "+962", country: "JO", flagUrl: "https://flagcdn.com/jo.svg" }, // Jordan
    { code: "+7", country: "KZ", flagUrl: "https://flagcdn.com/kz.svg" }, // Kazakhstan
    { code: "+254", country: "KE", flagUrl: "https://flagcdn.com/ke.svg" }, // Kenya
    { code: "+686", country: "KI", flagUrl: "https://flagcdn.com/ki.svg" }, // Kiribati
    { code: "+850", country: "KP", flagUrl: "https://flagcdn.com/kp.svg" }, // Korea, North
    { code: "+82", country: "KR", flagUrl: "https://flagcdn.com/kr.svg" }, // Korea, South
    { code: "+383", country: "XK", flagUrl: "https://flagcdn.com/xk.svg" }, // Kosovo
    { code: "+965", country: "KW", flagUrl: "https://flagcdn.com/kw.svg" }, // Kuwait
    { code: "+996", country: "KG", flagUrl: "https://flagcdn.com/kg.svg" }, // Kyrgyzstan
    { code: "+856", country: "LA", flagUrl: "https://flagcdn.com/la.svg" }, // Laos
    { code: "+371", country: "LV", flagUrl: "https://flagcdn.com/lv.svg" }, // Latvia
    { code: "+961", country: "LB", flagUrl: "https://flagcdn.com/lb.svg" }, // Lebanon
    { code: "+266", country: "LS", flagUrl: "https://flagcdn.com/ls.svg" }, // Lesotho
    { code: "+231", country: "LR", flagUrl: "https://flagcdn.com/lr.svg" }, // Liberia
    { code: "+218", country: "LY", flagUrl: "https://flagcdn.com/ly.svg" }, // Libya
    { code: "+423", country: "LI", flagUrl: "https://flagcdn.com/li.svg" }, // Liechtenstein
    { code: "+370", country: "LT", flagUrl: "https://flagcdn.com/lt.svg" }, // Lithuania
    { code: "+352", country: "LU", flagUrl: "https://flagcdn.com/lu.svg" }, // Luxembourg
    { code: "+853", country: "MO", flagUrl: "https://flagcdn.com/mo.svg" }, // Macau
    { code: "+261", country: "MG", flagUrl: "https://flagcdn.com/mg.svg" }, // Madagascar
    { code: "+265", country: "MW", flagUrl: "https://flagcdn.com/mw.svg" }, // Malawi
    { code: "+60", country: "MY", flagUrl: "https://flagcdn.com/my.svg" }, // Malaysia
    { code: "+960", country: "MV", flagUrl: "https://flagcdn.com/mv.svg" }, // Maldives
    { code: "+223", country: "ML", flagUrl: "https://flagcdn.com/ml.svg" }, // Mali
    { code: "+356", country: "MT", flagUrl: "https://flagcdn.com/mt.svg" }, // Malta
    { code: "+692", country: "MH", flagUrl: "https://flagcdn.com/mh.svg" }, // Marshall Islands
    { code: "+596", country: "MQ", flagUrl: "https://flagcdn.com/mq.svg" }, // Martinique
    { code: "+222", country: "MR", flagUrl: "https://flagcdn.com/mr.svg" }, // Mauritania
    { code: "+230", country: "MU", flagUrl: "https://flagcdn.com/mu.svg" }, // Mauritius
    { code: "+262", country: "YT", flagUrl: "https://flagcdn.com/yt.svg" }, // Mayotte
    { code: "+52", country: "MX", flagUrl: "https://flagcdn.com/mx.svg" }, // Mexico
    { code: "+691", country: "FM", flagUrl: "https://flagcdn.com/fm.svg" }, // Micronesia, Federated States of
    { code: "+373", country: "MD", flagUrl: "https://flagcdn.com/md.svg" }, // Moldova
    { code: "+377", country: "MC", flagUrl: "https://flagcdn.com/mc.svg" }, // Monaco
    { code: "+976", country: "MN", flagUrl: "https://flagcdn.com/mn.svg" }, // Mongolia
    { code: "+382", country: "ME", flagUrl: "https://flagcdn.com/me.svg" }, // Montenegro
    { code: "+1", country: "MS", flagUrl: "https://flagcdn.com/ms.svg" }, // Montserrat
    { code: "+212", country: "MA", flagUrl: "https://flagcdn.com/ma.svg" }, // Morocco
    { code: "+258", country: "MZ", flagUrl: "https://flagcdn.com/mz.svg" }, // Mozambique
    { code: "+95", country: "MM", flagUrl: "https://flagcdn.com/mm.svg" }, // Myanmar
    { code: "+264", country: "NA", flagUrl: "https://flagcdn.com/na.svg" }, // Namibia
    { code: "+674", country: "NR", flagUrl: "https://flagcdn.com/nr.svg" }, // Nauru
    { code: "+977", country: "NP", flagUrl: "https://flagcdn.com/np.svg" }, // Nepal
    { code: "+31", country: "NL", flagUrl: "https://flagcdn.com/nl.svg" }, // Netherlands
    { code: "+1", country: "KN", flagUrl: "https://flagcdn.com/kn.svg" }, // Nevis
    { code: "+687", country: "NC", flagUrl: "https://flagcdn.com/nc.svg" }, // New Caledonia
    { code: "+64", country: "NZ", flagUrl: "https://flagcdn.com/nz.svg" }, // New Zealand
    { code: "+505", country: "NI", flagUrl: "https://flagcdn.com/ni.svg" }, // Nicaragua
    { code: "+227", country: "NE", flagUrl: "https://flagcdn.com/ne.svg" }, // Niger
    { code: "+234", country: "NG", flagUrl: "https://flagcdn.com/ng.svg" }, // Nigeria
    { code: "+683", country: "NU", flagUrl: "https://flagcdn.com/nu.svg" }, // Niue
    { code: "+672", country: "NF", flagUrl: "https://flagcdn.com/nf.svg" }, // Norfolk Island
    { code: "+389", country: "MK", flagUrl: "https://flagcdn.com/mk.svg" }, // North Macedonia
    { code: "+90", country: "TR", flagUrl: "https://flagcdn.com/tr.svg" }, // Northern Cyprus (Turkey)
    { code: "+44", country: "GB", flagUrl: "https://flagcdn.com/gb.svg" }, // Northern Ireland
    { code: "+1", country: "MP", flagUrl: "https://flagcdn.com/mp.svg" }, // Northern Mariana Islands
    { code: "+47", country: "NO", flagUrl: "https://flagcdn.com/no.svg" }, // Norway
    { code: "+968", country: "OM", flagUrl: "https://flagcdn.com/om.svg" }, // Oman
    { code: "+92", country: "PK", flagUrl: "https://flagcdn.com/pk.svg" }, // Pakistan
    { code: "+680", country: "PW", flagUrl: "https://flagcdn.com/pw.svg" }, // Palau
    { code: "+970", country: "PS", flagUrl: "https://flagcdn.com/ps.svg" }, // Palestine
    { code: "+507", country: "PA", flagUrl: "https://flagcdn.com/pa.svg" }, // Panama
    { code: "+675", country: "PG", flagUrl: "https://flagcdn.com/pg.svg" }, // Papua New Guinea
    { code: "+595", country: "PY", flagUrl: "https://flagcdn.com/py.svg" }, // Paraguay
    { code: "+51", country: "PE", flagUrl: "https://flagcdn.com/pe.svg" }, // Peru
    { code: "+63", country: "PH", flagUrl: "https://flagcdn.com/ph.svg" }, // Philippines
    { code: "+64", country: "PN", flagUrl: "https://flagcdn.com/pn.svg" }, // Pitcairn Islands
    { code: "+48", country: "PL", flagUrl: "https://flagcdn.com/pl.svg" }, // Poland
    { code: "+351", country: "PT", flagUrl: "https://flagcdn.com/pt.svg" }, // Portugal
    { code: "+1", country: "PR", flagUrl: "https://flagcdn.com/pr.svg" }, // Puerto Rico
    { code: "+974", country: "QA", flagUrl: "https://flagcdn.com/qa.svg" }, // Qatar
    { code: "+262", country: "RE", flagUrl: "https://flagcdn.com/re.svg" }, // Réunion
    { code: "+40", country: "RO", flagUrl: "https://flagcdn.com/ro.svg" }, // Romania
    { code: "+7", country: "RU", flagUrl: "https://flagcdn.com/ru.svg" }, // Russia
    { code: "+250", country: "RW", flagUrl: "https://flagcdn.com/rw.svg" }, // Rwanda
    { code: "+599", country: "BQ", flagUrl: "https://flagcdn.com/bq.svg" }, // Saba
    { code: "+590", country: "BL", flagUrl: "https://flagcdn.com/bl.svg" }, // Saint Barthélemy
    { code: "+290", country: "SH", flagUrl: "https://flagcdn.com/sh.svg" }, // Saint Helena
    { code: "+1", country: "KN", flagUrl: "https://flagcdn.com/kn.svg" }, // Saint Kitts and Nevis
    { code: "+1", country: "LC", flagUrl: "https://flagcdn.com/lc.svg" }, // Saint Lucia
    { code: "+590", country: "MF", flagUrl: "https://flagcdn.com/mf.svg" }, // Saint Martin (France)
    { code: "+508", country: "PM", flagUrl: "https://flagcdn.com/pm.svg" }, // Saint Pierre and Miquelon
    { code: "+1", country: "VC", flagUrl: "https://flagcdn.com/vc.svg" }, // Saint Vincent and the Grenadines
    { code: "+685", country: "WS", flagUrl: "https://flagcdn.com/ws.svg" }, // Samoa
    { code: "+378", country: "SM", flagUrl: "https://flagcdn.com/sm.svg" }, // San Marino
    { code: "+239", country: "ST", flagUrl: "https://flagcdn.com/st.svg" }, // São Tomé and Príncipe
    { code: "+966", country: "SA", flagUrl: "https://flagcdn.com/sa.svg" }, // Saudi Arabia
    { code: "+221", country: "SN", flagUrl: "https://flagcdn.com/sn.svg" }, // Senegal
    { code: "+381", country: "RS", flagUrl: "https://flagcdn.com/rs.svg" }, // Serbia
    { code: "+248", country: "SC", flagUrl: "https://flagcdn.com/sc.svg" }, // Seychelles
    { code: "+232", country: "SL", flagUrl: "https://flagcdn.com/sl.svg" }, // Sierra Leone
    { code: "+65", country: "SG", flagUrl: "https://flagcdn.com/sg.svg" }, // Singapore
    { code: "+599", country: "BQ", flagUrl: "https://flagcdn.com/bq.svg" }, // Sint Eustatius
    { code: "+1", country: "SX", flagUrl: "https://flagcdn.com/sx.svg" }, // Sint Maarten (Netherlands)
    { code: "+421", country: "SK", flagUrl: "https://flagcdn.com/sk.svg" }, // Slovakia
    { code: "+386", country: "SI", flagUrl: "https://flagcdn.com/si.svg" }, // Slovenia
    { code: "+677", country: "SB", flagUrl: "https://flagcdn.com/sb.svg" }, // Solomon Islands
    { code: "+252", country: "SO", flagUrl: "https://flagcdn.com/so.svg" }, // Somalia
    { code: "+27", country: "ZA", flagUrl: "https://flagcdn.com/za.svg" }, // South Africa
    { code: "+500", country: "GS", flagUrl: "https://flagcdn.com/gs.svg" }, // South Georgia and the South Sandwich Islands
    { code: "+7", country: "GE", flagUrl: "https://flagcdn.com/ge.svg" }, // South Ossetia (uses Georgia)
    { code: "+211", country: "SS", flagUrl: "https://flagcdn.com/ss.svg" }, // South Sudan
    { code: "+34", country: "ES", flagUrl: "https://flagcdn.com/es.svg" }, // Spain
    { code: "+94", country: "LK", flagUrl: "https://flagcdn.com/lk.svg" }, // Sri Lanka
    { code: "+249", country: "SD", flagUrl: "https://flagcdn.com/sd.svg" }, // Sudan
    { code: "+597", country: "SR", flagUrl: "https://flagcdn.com/sr.svg" }, // Suriname
    { code: "+47", country: "SJ", flagUrl: "https://flagcdn.com/sj.svg" }, // Svalbard
    { code: "+46", country: "SE", flagUrl: "https://flagcdn.com/se.svg" }, // Sweden
    { code: "+41", country: "CH", flagUrl: "https://flagcdn.com/ch.svg" }, // Switzerland
    { code: "+963", country: "SY", flagUrl: "https://flagcdn.com/sy.svg" }, // Syria
    { code: "+886", country: "TW", flagUrl: "https://flagcdn.com/tw.svg" }, // Taiwan
    { code: "+992", country: "TJ", flagUrl: "https://flagcdn.com/tj.svg" }, // Tajikistan
    { code: "+255", country: "TZ", flagUrl: "https://flagcdn.com/tz.svg" }, // Tanzania
    { code: "+66", country: "TH", flagUrl: "https://flagcdn.com/th.svg" }, // Thailand
    { code: "+670", country: "TL", flagUrl: "https://flagcdn.com/tl.svg" }, // East Timor (Timor-Leste)
    { code: "+228", country: "TG", flagUrl: "https://flagcdn.com/tg.svg" }, // Togo
    { code: "+690", country: "TK", flagUrl: "https://flagcdn.com/tk.svg" }, // Tokelau
    { code: "+676", country: "TO", flagUrl: "https://flagcdn.com/to.svg" }, // Tonga
    { code: "+373", country: "MD", flagUrl: "https://flagcdn.com/md.svg" }, // Transnistria (uses Moldova)
    { code: "+1", country: "TT", flagUrl: "https://flagcdn.com/tt.svg" }, // Trinidad and Tobago
    { code: "+290", country: "TA", flagUrl: "https://flagcdn.com/ta.svg" }, // Tristan da Cunha
    { code: "+216", country: "TN", flagUrl: "https://flagcdn.com/tn.svg" }, // Tunisia
    { code: "+90", country: "TR", flagUrl: "https://flagcdn.com/tr.svg" }, // Turkey
    { code: "+993", country: "TM", flagUrl: "https://flagcdn.com/tm.svg" }, // Turkmenistan
    { code: "+1", country: "TC", flagUrl: "https://flagcdn.com/tc.svg" }, // Turks and Caicos Islands
    { code: "+688", country: "TV", flagUrl: "https://flagcdn.com/tv.svg" }, // Tuvalu
    { code: "+256", country: "UG", flagUrl: "https://flagcdn.com/ug.svg" }, // Uganda
    { code: "+380", country: "UA", flagUrl: "https://flagcdn.com/ua.svg" }, // Ukraine
    { code: "+971", country: "AE", flagUrl: "https://flagcdn.com/ae.svg" }, // United Arab Emirates
    { code: "+44", country: "GB", flagUrl: "https://flagcdn.com/gb.svg" }, // United Kingdom
    { code: "+1", country: "US", flagUrl: "https://flagcdn.com/us.svg" }, // United States
    { code: "+598", country: "UY", flagUrl: "https://flagcdn.com/uy.svg" }, // Uruguay
    { code: "+1", country: "VI", flagUrl: "https://flagcdn.com/vi.svg" }, // US Virgin Islands
    { code: "+998", country: "UZ", flagUrl: "https://flagcdn.com/uz.svg" }, // Uzbekistan
    { code: "+678", country: "VU", flagUrl: "https://flagcdn.com/vu.svg" }, // Vanuatu
    { code: "+39", country: "VA", flagUrl: "https://flagcdn.com/va.svg" }, // Vatican City State (Holy See)
    { code: "+58", country: "VE", flagUrl: "https://flagcdn.com/ve.svg" }, // Venezuela
    { code: "+84", country: "VN", flagUrl: "https://flagcdn.com/vn.svg" }, // Vietnam
    { code: "+1", country: "US", flagUrl: "https://flagcdn.com/us.svg" }, // Wake Island, USA
    { code: "+681", country: "WF", flagUrl: "https://flagcdn.com/wf.svg" }, // Wallis and Futuna
    { code: "+967", country: "YE", flagUrl: "https://flagcdn.com/ye.svg" }, // Yemen
    { code: "+260", country: "ZM", flagUrl: "https://flagcdn.com/zm.svg" }, // Zambia
    { code: "+255", country: "TZ", flagUrl: "https://flagcdn.com/tz.svg" }, // Zanzibar (Tanzania)
    { code: "+263", country: "ZW", flagUrl: "https://flagcdn.com/zw.svg" } // Zimbabwe
  ]

  let {
    timeZone,
    zipCode,
    firstName,
    lastName,
    email,
    phoneNo,
    city,
    state,
    country,
    countryCode,
    gender,
    mailingAddress
  } = personalInformation

  const options = countries.flatMap((item) => {
    return item.phone?.map((phone) => ({
      value: item.iso2, // use this to match selected value
      label: (
        <div className="flex items-center gap-2 select-none">
          <span className="text-lg">{getEmojiFlag(item.iso2)}</span>+{phone} (
          {item.iso2})
        </div>
      )
    }))
  })

  if (countryCode && Number(countryCode)) {
    let codeNum = Number(countryCode)
    let newCode = "US"

    if (codeNum == 1) {
      newCode = "US"
    } else {
      newCode =
        countries.find((item) => item.phone?.includes(codeNum))?.iso2 || "US"
    }

    onChange("countryCode", newCode)
  }

  return (
    <>
      <div className="items-center justify-start w-full flex py-7">
        <p className="text-xl font-normal border-b-2 border-purple pb-1">
          Personal Information
        </p>
      </div>

      <div className="md:space-y-2 md:w-[80%]">
        <div className="flex flex-col lg:flex-row lg:gap-20">
          <InputItem
            label={"First Name"}
            placeholder="First Name"
            className="w-full"
            value={firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            error={errors?.firstName || nameError?.firstName}
          />
          <InputItem
            label={"Last Name"}
            placeholder="Last Name"
            className="w-full"
            value={lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            error={errors?.lastName || nameError?.lastName}
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-20">
          <InputItem
            label={"Email"}
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            error={errors?.email}
          />

          <div className="w-full flex flex-col gap-0.5">
            <label htmlFor="">Phone No</label>
            <div className="flex items-center">
              <div className="w-[180px] text-primary">
                <Select
                  defaultInputValue=""
                  options={options}
                  value={options.find((option) => option.value === countryCode)} // auto-select based on countryCode
                  onChange={(selected) =>
                    onChange("countryCode", selected?.value || "")
                  } // update using selected.value
                  placeholder="Select"
                  className="text-primary text-sm"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: "#fbfbfb14", // dropdown background
                      border: "1px solid #3c3c3c", // proper border style
                      color: "#ffffff",
                      padding: "8px",
                      boxShadow: state.isFocused ? "0 0 0 1px #00bfff" : "none",
                      "&:hover": {
                        borderColor: "#00bfff"
                      }
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#ffffff" // selected text color
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#2c2c2c", // darker dropdown background
                      zIndex: 20
                      // border: "1px solid #00bfff",
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isFocused
                        ? "#00bfff33"
                        : isSelected
                        ? "#00bfff"
                        : "#454545",
                      color: isFocused || isSelected ? "#ffffff" : "#ffffff",
                      fontSize: "1rem",
                      cursor: "pointer"
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#bcbcbc" // light placeholder
                    })
                  }}
                />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                className="flex-1 bg-dropdownBackground text-primary border border-l-0 border-formBorders px-3 py-3.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple"
                value={phoneNo}
                onChange={(e) => onChange("phoneNo", e.target.value)}
              />
            </div>
            {(errors?.phoneNo || errors?.countryCode) && (
              <p className="text-red-500 text-sm mt-1">
                {"This field is required"}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-20">
          <InputItem
            label="Country"
            placeholder="Country"
            className="w-full"
            value={country}
            error={errors?.country}
            onChange={(e) => onChange("country", e.target.value)}
          />
          <InputItem
            label="State"
            placeholder="State"
            className="w-full"
            value={state}
            error={errors?.state}
            onChange={(e) => onChange("state", e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-20">
          <InputItem
            label="City"
            placeholder="City"
            className="w-full"
            value={city}
            error={errors?.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
          <InputItem
            label="Zip Code"
            placeholder="Zip Code"
            className="w-full"
            value={zipCode}
            error={errors?.zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-20">
          <SelectItem
            label={"Time Zone"}
            error={errors?.timeZone}
            className=""
            value={timeZone}
            onChange={(e) => onChange("timeZone", e.target.value)}>
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Select Time Zone
            </option>
            <option className="text-primary bg-inputBackGround" value="Eastern">
              Eastern
            </option>
            <option className="text-primary bg-inputBackGround" value="Central">
              Central
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Mountain">
              Mountain
            </option>
            <option className="text-primary bg-inputBackGround" value="Pacific">
              Pacific
            </option>
            <option className="text-primary bg-inputBackGround" value="Other">
              Other
            </option>
          </SelectItem>

          <SelectItem
            label={"Gender"}
            error={errors?.gender}
            className=""
            value={gender}
            onChange={(e) => onChange("gender", e.target.value)}>
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Select Gender
            </option>
            <option className="text-primary bg-inputBackGround" value="male">
              Male
            </option>
            <option className="text-primary bg-inputBackGround" value="female">
              Female
            </option>
          </SelectItem>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-20">
          <InputItem
            label="Complete Mailing Address"
            placeholder="Complete mailing address"
            className="w-full"
            value={mailingAddress}
            error={errors?.mailingAddress}
            onChange={(e) => onChange("mailingAddress", e.target.value)}
          />
        </div>
      </div>
    </>
  )
}

export default PersonalData
