
import { ClipLoader } from "react-spinners";
import "../styles/login.scss"

const Loading = () => {
  
  return (
    <div className="loading_1" >
      <ClipLoader   height="20"
    width="20"
    color="rgba(59, 130, 246, 1)"
    strokeWidth='loading'  />
    </div>
  );
};

export default Loading;