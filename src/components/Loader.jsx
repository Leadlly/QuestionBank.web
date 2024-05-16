import "../styles/login.scss";
import { ClipLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="loading">
      <ClipLoader
        height="100"
        width="100"
        color="rgba(59, 130, 246, 1)"
        aria-label="loading"
      />
    </div>
  );
};

export default Loader;
