
import { ClipLoader } from "react-spinners";
import "../styles/login.scss"

const Loading = () => {
  
  return (
    <div className="loading_1" >
      <ClipLoader   height="15"
    width="15"
    color="rgba(59, 130, 246, 1)"
    strokeWidth='loading'  />
    </div>
  );
};

export default Loading;