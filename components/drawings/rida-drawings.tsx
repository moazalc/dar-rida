/**
 * Line drawings of the four collection designs, in the same style as the
 * Design Your Abaya preview. Each follows the developer brief:
 * RIDA 01 A-line + cascade on the sleeves, RIDA 02 straight + two crystal lines
 * per sleeve ending at different heights, RIDA 03 wrap + one-sided cluster near
 * the hem, RIDA 04 bisht + crystals along the box-pleat edges.
 * Shapes are styled by the `.abaya-drawing` rules in globals.css.
 * Crystal positions were generated once (seeded) and are fixed here.
 */

export const ridaModels = ["rida-01", "rida-02", "rida-03", "rida-04"] as const;
export type RidaModel = (typeof ridaModels)[number];

const Rida01 = (
  <>
      <path className="g" d="M138,40 Q160,32 182,40 L216,58 L208,150 L258,530 Q160,546 62,530 L112,150 L104,58 Z"/>
      <path className="s" d="M136,200 Q128,360 104,528 M184,200 Q192,360 216,528 M160,62 L160,540"/>
      <path className="n" d="M139,41 Q160,66 181,41"/>
      <path className="g" d="M104,58 Q80,170 46,294 L88,308 Q102,220 112,150 Z"/>
      <path className="g" d="M216,58 Q240,170 274,294 L232,308 Q218,220 208,150 Z"/>
      <path className="s" d="M92,120 Q74,210 62,298 M228,120 Q246,210 258,298"/>
      <g className="c">
        <circle cx="60.2" cy="284.0" r="0.87"/>
        <circle cx="68.2" cy="245.3" r="1.13"/>
        <circle cx="71.5" cy="264.1" r="1.54"/>
        <circle cx="68.3" cy="297.8" r="0.80"/>
        <circle cx="66.0" cy="297.2" r="1.44"/>
        <circle cx="55.7" cy="293.5" r="1.09"/>
        <circle cx="81.5" cy="280.8" r="1.15"/>
        <circle cx="60.0" cy="293.9" r="1.45"/>
        <circle cx="89.4" cy="253.4" r="1.05"/>
        <circle cx="73.6" cy="258.5" r="1.16"/>
        <circle cx="86.6" cy="175.8" r="1.32"/>
        <circle cx="83.7" cy="204.7" r="1.58"/>
        <circle cx="56.9" cy="292.4" r="1.01"/>
        <circle cx="79.3" cy="291.0" r="1.45"/>
        <circle cx="71.1" cy="295.8" r="1.34"/>
        <circle cx="75.2" cy="248.7" r="1.27"/>
        <circle cx="63.8" cy="260.5" r="1.06"/>
        <circle cx="59.2" cy="294.8" r="1.01"/>
        <circle cx="78.2" cy="241.8" r="0.75"/>
        <circle cx="72.7" cy="288.6" r="0.82"/>
        <circle cx="67.3" cy="273.6" r="0.76"/>
        <circle cx="89.3" cy="219.6" r="1.37"/>
        <circle cx="71.5" cy="292.8" r="0.93"/>
        <circle cx="84.9" cy="268.8" r="0.85"/>
        <circle cx="77.0" cy="232.2" r="0.78"/>
        <circle cx="88.2" cy="174.5" r="1.46"/>
        <circle cx="79.4" cy="280.9" r="1.48"/>
        <circle cx="68.1" cy="295.8" r="1.30"/>
        <circle cx="73.1" cy="299.6" r="0.95"/>
        <circle cx="85.2" cy="225.9" r="0.92"/>
        <circle cx="85.1" cy="200.7" r="0.96"/>
        <circle cx="82.9" cy="239.7" r="1.11"/>
        <circle cx="75.3" cy="258.4" r="0.84"/>
        <circle cx="96.5" cy="209.2" r="1.10"/>
        <circle cx="78.0" cy="273.9" r="0.94"/>
        <circle cx="74.1" cy="299.8" r="1.57"/>
        <circle cx="91.1" cy="250.2" r="1.58"/>
        <circle cx="81.6" cy="213.1" r="1.19"/>
        <circle cx="76.3" cy="283.3" r="0.92"/>
        <circle cx="66.8" cy="297.6" r="1.57"/>
        <circle cx="57.1" cy="291.7" r="0.98"/>
        <circle cx="76.2" cy="300.4" r="1.02"/>
        <circle cx="60.7" cy="294.0" r="0.70"/>
        <circle cx="82.1" cy="284.5" r="1.04"/>
        <circle cx="66.6" cy="297.0" r="1.13"/>
        <circle cx="85.7" cy="265.4" r="1.15"/>
        <circle cx="93.9" cy="214.1" r="0.88"/>
        <circle cx="67.2" cy="289.4" r="1.15"/>
        <circle cx="82.0" cy="287.6" r="0.70"/>
        <circle cx="87.2" cy="180.3" r="0.94"/>
        <circle cx="60.6" cy="292.5" r="0.78"/>
        <circle cx="68.7" cy="292.5" r="1.06"/>
        <circle cx="70.6" cy="255.9" r="0.74"/>
        <circle cx="65.5" cy="297.2" r="0.72"/>
        <circle cx="73.0" cy="284.0" r="0.97"/>
        <circle cx="96.6" cy="180.1" r="0.91"/>
        <circle cx="77.7" cy="268.4" r="1.23"/>
        <circle cx="68.9" cy="241.0" r="1.18"/>
        <circle cx="95.7" cy="194.3" r="1.38"/>
        <circle cx="94.9" cy="200.7" r="1.29"/>
        <circle cx="68.7" cy="280.5" r="1.34"/>
        <circle cx="72.2" cy="298.5" r="1.49"/>
        <circle cx="55.0" cy="293.4" r="1.05"/>
        <circle cx="58.8" cy="290.6" r="0.99"/>
        <circle cx="57.6" cy="281.9" r="1.59"/>
        <circle cx="57.5" cy="294.5" r="0.83"/>
        <circle cx="64.1" cy="295.8" r="1.35"/>
        <circle cx="79.3" cy="301.7" r="1.28"/>
        <circle cx="68.6" cy="251.5" r="0.74"/>
        <circle cx="64.8" cy="290.3" r="1.45"/>
        <circle cx="60.2" cy="280.6" r="1.50"/>
        <circle cx="97.8" cy="207.0" r="1.26"/>
        <circle cx="72.8" cy="273.6" r="1.36"/>
        <circle cx="56.1" cy="293.4" r="1.43"/>
        <circle cx="63.8" cy="283.6" r="0.83"/>
        <circle cx="79.3" cy="211.4" r="1.17"/>
        <circle cx="81.6" cy="302.5" r="1.15"/>
        <circle cx="65.4" cy="263.6" r="1.45"/>
        <circle cx="62.7" cy="260.9" r="1.42"/>
        <circle cx="87.8" cy="269.1" r="1.44"/>
        <circle cx="92.3" cy="203.5" r="1.23"/>
        <circle cx="65.5" cy="290.0" r="1.50"/>
        <circle cx="76.7" cy="298.1" r="1.31"/>
        <circle cx="82.5" cy="267.2" r="1.32"/>
        <circle cx="62.4" cy="284.2" r="0.91"/>
        <circle cx="96.2" cy="216.1" r="0.73"/>
        <circle cx="94.1" cy="206.1" r="0.82"/>
        <circle cx="91.2" cy="214.3" r="1.02"/>
        <circle cx="69.6" cy="293.2" r="0.79"/>
        <circle cx="57.3" cy="280.5" r="1.45"/>
        <circle cx="61.3" cy="295.7" r="1.20"/>
        <circle cx="75.1" cy="293.1" r="1.26"/>
        <circle cx="92.4" cy="179.8" r="1.26"/>
        <circle cx="101.3" cy="183.8" r="1.31"/>
        <circle cx="90.9" cy="180.5" r="1.14"/>
        <circle cx="259.1" cy="290.7" r="0.70"/>
        <circle cx="260.0" cy="291.5" r="1.42"/>
        <circle cx="231.9" cy="253.8" r="1.37"/>
        <circle cx="233.3" cy="209.0" r="1.15"/>
        <circle cx="233.6" cy="248.2" r="1.18"/>
        <circle cx="247.0" cy="299.0" r="1.29"/>
        <circle cx="223.8" cy="191.6" r="0.76"/>
        <circle cx="237.6" cy="228.6" r="1.36"/>
        <circle cx="242.7" cy="297.9" r="0.93"/>
        <circle cx="240.8" cy="289.1" r="0.77"/>
        <circle cx="227.6" cy="175.8" r="0.94"/>
        <circle cx="235.5" cy="284.1" r="1.36"/>
        <circle cx="246.0" cy="232.7" r="0.88"/>
        <circle cx="262.2" cy="293.1" r="1.37"/>
        <circle cx="223.6" cy="192.8" r="1.58"/>
        <circle cx="241.8" cy="299.3" r="1.14"/>
        <circle cx="222.5" cy="172.5" r="1.04"/>
        <circle cx="247.8" cy="285.4" r="1.13"/>
        <circle cx="266.3" cy="291.7" r="1.32"/>
        <circle cx="223.1" cy="175.2" r="1.39"/>
        <circle cx="233.5" cy="269.0" r="1.26"/>
        <circle cx="237.1" cy="280.1" r="1.28"/>
        <circle cx="239.8" cy="212.1" r="0.77"/>
        <circle cx="256.8" cy="289.8" r="0.83"/>
        <circle cx="248.2" cy="293.1" r="0.93"/>
        <circle cx="253.0" cy="290.5" r="1.37"/>
        <circle cx="239.3" cy="300.6" r="0.97"/>
        <circle cx="250.4" cy="284.4" r="1.21"/>
        <circle cx="232.9" cy="260.4" r="0.71"/>
        <circle cx="236.0" cy="281.9" r="0.75"/>
        <circle cx="245.0" cy="269.6" r="0.94"/>
        <circle cx="258.3" cy="263.4" r="1.30"/>
        <circle cx="256.3" cy="274.1" r="1.32"/>
        <circle cx="243.0" cy="301.0" r="1.31"/>
        <circle cx="252.2" cy="295.0" r="0.96"/>
        <circle cx="236.9" cy="233.8" r="1.16"/>
        <circle cx="249.1" cy="287.1" r="1.12"/>
        <circle cx="236.8" cy="264.0" r="1.12"/>
        <circle cx="250.0" cy="297.7" r="0.81"/>
        <circle cx="257.3" cy="289.8" r="1.50"/>
        <circle cx="236.0" cy="224.1" r="0.88"/>
        <circle cx="237.2" cy="262.9" r="1.58"/>
        <circle cx="230.2" cy="191.4" r="1.54"/>
        <circle cx="242.3" cy="253.6" r="0.72"/>
        <circle cx="240.3" cy="269.4" r="1.11"/>
        <circle cx="246.2" cy="275.5" r="1.44"/>
        <circle cx="234.3" cy="275.5" r="1.57"/>
        <circle cx="230.2" cy="240.0" r="1.10"/>
        <circle cx="231.9" cy="184.1" r="0.94"/>
        <circle cx="232.5" cy="264.3" r="0.89"/>
        <circle cx="240.6" cy="208.9" r="1.55"/>
        <circle cx="253.5" cy="296.2" r="0.89"/>
        <circle cx="259.7" cy="295.0" r="1.22"/>
        <circle cx="246.8" cy="299.3" r="0.83"/>
        <circle cx="226.7" cy="222.3" r="1.17"/>
        <circle cx="245.1" cy="298.0" r="1.56"/>
        <circle cx="249.6" cy="244.1" r="0.82"/>
        <circle cx="221.4" cy="198.4" r="1.44"/>
        <circle cx="237.5" cy="297.7" r="1.16"/>
        <circle cx="248.7" cy="280.7" r="1.50"/>
        <circle cx="218.9" cy="169.1" r="1.33"/>
        <circle cx="253.5" cy="295.0" r="0.91"/>
        <circle cx="249.8" cy="266.5" r="1.51"/>
        <circle cx="256.6" cy="292.6" r="1.14"/>
        <circle cx="249.7" cy="232.7" r="0.72"/>
        <circle cx="245.9" cy="262.0" r="0.70"/>
        <circle cx="257.1" cy="296.3" r="1.14"/>
        <circle cx="241.8" cy="251.8" r="1.11"/>
        <circle cx="237.3" cy="302.6" r="0.97"/>
        <circle cx="224.9" cy="221.4" r="0.83"/>
        <circle cx="258.9" cy="294.7" r="1.01"/>
        <circle cx="243.5" cy="300.7" r="0.98"/>
        <circle cx="261.3" cy="287.2" r="1.46"/>
        <circle cx="236.2" cy="281.7" r="0.70"/>
        <circle cx="239.2" cy="213.7" r="1.38"/>
        <circle cx="239.0" cy="300.1" r="1.46"/>
        <circle cx="238.6" cy="261.2" r="0.81"/>
        <circle cx="265.2" cy="292.9" r="1.53"/>
        <circle cx="241.5" cy="240.4" r="1.34"/>
        <circle cx="238.7" cy="302.0" r="1.51"/>
        <circle cx="234.1" cy="251.5" r="0.96"/>
        <circle cx="241.1" cy="301.0" r="1.03"/>
        <circle cx="241.0" cy="301.3" r="1.05"/>
        <circle cx="251.6" cy="273.8" r="1.60"/>
        <circle cx="233.0" cy="265.2" r="1.23"/>
        <circle cx="261.4" cy="287.4" r="1.02"/>
        <circle cx="252.2" cy="264.4" r="1.09"/>
        <circle cx="262.0" cy="293.6" r="0.95"/>
        <circle cx="261.0" cy="294.8" r="0.74"/>
        <circle cx="255.5" cy="286.2" r="0.79"/>
        <circle cx="241.5" cy="226.3" r="1.45"/>
        <circle cx="254.7" cy="267.3" r="0.96"/>
        <circle cx="263.2" cy="281.1" r="1.54"/>
        <circle cx="265.0" cy="287.2" r="0.92"/>
        <circle cx="236.7" cy="232.2" r="0.94"/>
      </g>
  </>
);

const Rida02 = (
  <>
      <path className="g" d="M138,40 Q160,32 182,40 L216,58 L210,150 L218,532 Q160,540 102,532 L110,150 L104,58 Z"/>
      <path className="s" d="M135,180 L132,530 M185,180 L188,530 M160,62 L160,536"/>
      <path className="n" d="M139,41 Q160,66 181,41"/>
      <path className="g" d="M104,58 Q90,170 74,302 L108,306 Q110,220 110,150 Z"/>
      <path className="g" d="M216,58 Q230,170 246,302 L212,306 Q210,220 210,150 Z"/>
      <path className="line" d="M84,300 L99,112 M96,302 L105,196 M236,300 L221,112 M224,302 L215,196"/>
  </>
);

const Rida03 = (
  <>
      <path className="g" d="M138,40 Q160,32 182,40 L218,58 L210,150 L238,530 Q160,543 82,530 L110,150 L102,58 Z"/>
      <path className="s" d="M132,240 Q124,380 112,530 M196,240 Q204,380 214,530"/>
      <path className="n" d="M140,42 Q172,118 198,206 L214,536"/>
      <path className="n" d="M180,41 Q172,60 166,74"/>
      <path className="g" d="M109,198 Q160,212 211,198 L212,212 Q160,226 108,212 Z"/>
      <path className="g" d="M198,212 Q204,252 196,296 L206,298 Q214,252 206,212 Z"/>
      <path className="g" d="M204,212 Q216,244 220,284 L229,281 Q224,240 210,212 Z"/>
      <path className="g" d="M102,58 Q84,175 58,300 L96,308 Q104,220 110,150 Z"/>
      <path className="g" d="M218,58 Q236,175 262,300 L224,308 Q216,220 210,150 Z"/>
      <path className="s" d="M90,120 Q76,220 66,302 M230,120 Q244,220 254,302"/>
      <g className="c">
        <circle cx="104.7" cy="474.2" r="0.87"/>
        <circle cx="112.2" cy="467.9" r="0.67"/>
        <circle cx="96.5" cy="454.1" r="0.64"/>
        <circle cx="131.5" cy="458.2" r="1.21"/>
        <circle cx="107.7" cy="449.3" r="0.96"/>
        <circle cx="118.2" cy="469.6" r="1.68"/>
        <circle cx="112.0" cy="467.2" r="1.57"/>
        <circle cx="98.7" cy="453.8" r="1.69"/>
        <circle cx="112.4" cy="467.8" r="0.89"/>
        <circle cx="114.6" cy="470.2" r="0.69"/>
        <circle cx="107.1" cy="481.3" r="0.71"/>
        <circle cx="111.9" cy="466.8" r="1.15"/>
        <circle cx="104.6" cy="458.8" r="1.38"/>
        <circle cx="111.7" cy="468.7" r="1.09"/>
        <circle cx="120.7" cy="480.7" r="0.86"/>
        <circle cx="114.4" cy="471.2" r="1.06"/>
        <circle cx="103.3" cy="468.1" r="1.28"/>
        <circle cx="116.3" cy="486.7" r="1.34"/>
        <circle cx="90.3" cy="473.9" r="1.42"/>
        <circle cx="126.6" cy="482.6" r="1.53"/>
        <circle cx="111.2" cy="469.0" r="1.33"/>
        <circle cx="116.6" cy="470.5" r="0.73"/>
        <circle cx="111.7" cy="467.9" r="1.52"/>
        <circle cx="122.1" cy="460.8" r="0.92"/>
        <circle cx="112.0" cy="468.0" r="1.22"/>
        <circle cx="92.2" cy="465.5" r="1.01"/>
        <circle cx="121.7" cy="471.3" r="1.41"/>
        <circle cx="110.3" cy="476.3" r="0.82"/>
        <circle cx="104.6" cy="467.9" r="0.87"/>
        <circle cx="111.4" cy="467.5" r="0.87"/>
        <circle cx="111.2" cy="473.3" r="0.77"/>
        <circle cx="112.1" cy="474.6" r="1.57"/>
        <circle cx="127.3" cy="464.2" r="1.24"/>
        <circle cx="118.0" cy="461.0" r="0.96"/>
        <circle cx="113.3" cy="468.2" r="1.04"/>
        <circle cx="111.7" cy="466.9" r="1.69"/>
        <circle cx="97.9" cy="460.8" r="1.16"/>
        <circle cx="123.4" cy="468.0" r="0.85"/>
        <circle cx="122.4" cy="451.1" r="1.49"/>
        <circle cx="126.0" cy="453.0" r="1.32"/>
        <circle cx="121.8" cy="474.7" r="1.69"/>
        <circle cx="112.6" cy="468.8" r="0.71"/>
        <circle cx="133.3" cy="461.2" r="1.12"/>
        <circle cx="111.6" cy="466.2" r="1.50"/>
        <circle cx="92.9" cy="472.4" r="1.52"/>
        <circle cx="90.4" cy="462.0" r="1.61"/>
        <circle cx="114.5" cy="486.9" r="0.64"/>
        <circle cx="117.2" cy="465.6" r="0.92"/>
        <circle cx="117.3" cy="472.6" r="0.73"/>
        <circle cx="111.9" cy="477.2" r="0.81"/>
        <circle cx="126.9" cy="478.6" r="1.67"/>
        <circle cx="132.6" cy="476.1" r="1.24"/>
        <circle cx="94.6" cy="480.3" r="1.62"/>
        <circle cx="112.3" cy="469.7" r="1.01"/>
        <circle cx="111.7" cy="468.8" r="1.55"/>
        <circle cx="111.4" cy="468.1" r="1.09"/>
        <circle cx="129.0" cy="455.3" r="0.89"/>
        <circle cx="107.3" cy="468.6" r="1.46"/>
        <circle cx="112.5" cy="467.9" r="1.64"/>
        <circle cx="108.4" cy="457.7" r="0.72"/>
        <circle cx="111.5" cy="468.0" r="1.26"/>
        <circle cx="111.1" cy="466.5" r="1.28"/>
        <circle cx="106.5" cy="460.0" r="0.84"/>
        <circle cx="116.3" cy="466.2" r="1.01"/>
        <circle cx="111.9" cy="468.1" r="0.76"/>
        <circle cx="109.4" cy="469.2" r="0.82"/>
        <circle cx="112.9" cy="465.5" r="0.88"/>
        <circle cx="111.4" cy="460.1" r="1.26"/>
        <circle cx="122.9" cy="466.3" r="1.32"/>
        <circle cx="112.0" cy="468.1" r="0.82"/>
        <circle cx="112.7" cy="471.0" r="0.61"/>
        <circle cx="112.7" cy="459.2" r="0.96"/>
        <circle cx="100.7" cy="468.3" r="1.35"/>
        <circle cx="120.7" cy="485.5" r="0.80"/>
        <circle cx="111.2" cy="466.8" r="0.94"/>
        <circle cx="130.8" cy="462.8" r="0.82"/>
        <circle cx="114.2" cy="475.7" r="1.47"/>
        <circle cx="125.8" cy="466.1" r="1.20"/>
        <circle cx="113.9" cy="468.6" r="0.67"/>
        <circle cx="109.8" cy="469.5" r="0.71"/>
        <circle cx="109.5" cy="449.1" r="1.03"/>
        <circle cx="134.8" cy="467.7" r="1.21"/>
        <circle cx="117.7" cy="479.0" r="1.30"/>
        <circle cx="116.4" cy="466.4" r="0.70"/>
        <circle cx="112.0" cy="468.0" r="0.78"/>
        <circle cx="110.0" cy="469.6" r="1.36"/>
        <circle cx="116.9" cy="475.3" r="1.05"/>
        <circle cx="122.3" cy="468.2" r="0.91"/>
        <circle cx="113.6" cy="467.6" r="0.94"/>
        <circle cx="124.1" cy="477.9" r="1.65"/>
        <circle cx="105.3" cy="475.1" r="0.94"/>
        <circle cx="112.6" cy="467.0" r="1.22"/>
        <circle cx="118.3" cy="469.7" r="0.99"/>
        <circle cx="94.2" cy="470.5" r="1.06"/>
        <circle cx="120.0" cy="485.8" r="1.55"/>
        <circle cx="97.0" cy="482.3" r="1.70"/>
        <circle cx="110.3" cy="468.9" r="1.00"/>
        <circle cx="112.5" cy="467.0" r="0.82"/>
        <circle cx="112.1" cy="468.0" r="1.40"/>
        <circle cx="115.1" cy="469.1" r="0.82"/>
        <circle cx="111.8" cy="458.8" r="0.61"/>
        <circle cx="115.9" cy="465.6" r="1.59"/>
        <circle cx="117.6" cy="466.7" r="1.07"/>
        <circle cx="103.8" cy="461.8" r="1.50"/>
        <circle cx="111.6" cy="468.8" r="1.05"/>
        <circle cx="108.3" cy="486.8" r="1.57"/>
        <circle cx="131.7" cy="458.5" r="1.11"/>
        <circle cx="111.9" cy="467.9" r="0.78"/>
        <circle cx="112.2" cy="469.8" r="0.62"/>
        <circle cx="111.5" cy="468.1" r="1.21"/>
        <circle cx="94.8" cy="480.4" r="1.30"/>
        <circle cx="111.9" cy="477.0" r="1.60"/>
        <circle cx="130.6" cy="460.5" r="0.70"/>
        <circle cx="115.0" cy="473.5" r="1.28"/>
        <circle cx="115.5" cy="462.1" r="1.01"/>
        <circle cx="115.3" cy="449.2" r="1.15"/>
        <circle cx="107.1" cy="476.7" r="0.76"/>
        <circle cx="106.5" cy="473.4" r="0.91"/>
        <circle cx="112.2" cy="468.5" r="1.17"/>
        <circle cx="112.1" cy="463.6" r="1.62"/>
      </g>
  </>
);

const Rida04 = (
  <>
      <path className="g" d="M138,40 Q160,30 182,40 L264,80 L278,522 Q160,538 42,522 L56,80 Z"/>
      <path className="n" d="M148,44 L150,530 M172,44 L170,530"/>
      <path className="s" d="M150,46 L151,528 M170,46 L169,528" strokeOpacity={0.35} strokeWidth={3}/>
      <path className="g" d="M56,80 Q66,200 50,330 L118,334 Q112,200 124,96 Z"/>
      <path className="g" d="M264,80 Q254,200 270,330 L202,334 Q208,200 196,96 Z"/>
      <path className="n" d="M68,112 L62,326 M82,108 L78,328 M96,104 L94,330 M110,100 L108,332 M252,112 L258,326 M238,108 L242,328 M224,104 L226,330 M210,100 L212,332 "/>
      <path className="pleat" d="M71,152 L65,320 M85,148 L81,322 M99,144 L97,324 M113,140 L111,326 M255,152 L261,320 M241,148 L245,322 M227,144 L229,324 M213,140 L215,326 "/>
      <path className="s" d="M100,360 Q96,440 92,520 M220,360 Q224,440 228,520"/>
  </>
);

const drawings: Record<RidaModel, React.ReactNode> = {
  "rida-01": Rida01,
  "rida-02": Rida02,
  "rida-03": Rida03,
  "rida-04": Rida04,
};

export function RidaDrawing({ model, label, className }: { model: RidaModel; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 560" role="img" aria-label={label} className={["abaya-drawing", className].filter(Boolean).join(" ")}>
      {drawings[model]}
    </svg>
  );
}
