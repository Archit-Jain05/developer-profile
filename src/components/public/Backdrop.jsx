import "./Backdrop.css";

/** Fixed light behind the glass: one warm source above the hero, one cold fill low
    on the page, so the metal in the 3D scene has something to catch. */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__glow backdrop__glow--key" />
      <div className="backdrop__glow backdrop__glow--fill" />
      <div className="backdrop__grain" />
    </div>
  );
}
