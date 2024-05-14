import "../styles/login.scss";
import { RingLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="loading">
      <RingLoader
        height="100"
        width="100"
        color="rgba(89, 50, 173, 1)"
        aria-label="loading"
      />
    </div>
  );
};

export default Loader;
