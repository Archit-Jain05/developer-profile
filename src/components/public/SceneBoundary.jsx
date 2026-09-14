import { Component } from "react";

/** Shows the fallback if the 3D scene throws (e.g. WebGL context lost or unsupported). */
export default class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("[hero] 3D scene failed, showing static fallback:", error?.message ?? error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
