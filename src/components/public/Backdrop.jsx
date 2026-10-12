import "./Backdrop.css";

/** The page's ground: black, two soft burgundy glows that drift as the page
    scrolls so no stretch of it is flat, and a fibre texture so the large
    darks have tooth. */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__glow backdrop__glow--a" />
      <div className="backdrop__glow backdrop__glow--b" />
      <div className="backdrop__grain" />
    </div>
  );
}
