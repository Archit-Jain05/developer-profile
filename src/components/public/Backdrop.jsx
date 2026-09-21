import "./Backdrop.css";

/** The page's ground and its single fixed key light, plus a fibre texture so
    the large flat darks have tooth. Everything that casts or catches light on
    the site is derived from the one source declared here. */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__grain" />
    </div>
  );
}
