import React, { useContext } from "react";
import { Context } from "../main";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
const Requests = () => {
  const { profile, setProfile } = useContext(Context);

  const fetchUser = async () => {
    try {
      // Let's say we're fetching data from an API
      const { data } = await axios.get(`${server}/api/user/profile`, {
        withCredentials: true,
      });
      setProfile(data?.user);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const handleApprove = async (id) => {
    try {
      const { data } = await axios.get(`${server}/api/user/verify/${id}`, {
        withCredentials: true,
      });
      toast.success(data.message);

      fetchUser();
    } catch (error) {
      console.log(error);
      toast.error(error.reponse.data.message);
    }
  };
  return (
    <div className="flex flex-wrap">
      {profile && profile.requests.length > 0
        ? profile.requests.map((el) => (
            <>
              <div className="relative flex flex-col mt-6 m-7 text-white-700 bg-gray-700 shadow-md bg-clip-border rounded-xl w-96">
                <div className="p-6">
                  <h5 className="block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                    {el.name}
                  </h5>
                  <span
                    className={
                      el.status === "Not Verified"
                        ? "text-red-400"
                        : "text-green-500"
                    }
                  >
                    {el.status}
                  </span>
                  <p>{el.email}</p>
                  <p></p>
                </div>
                {el.status === "Not Verified" ? (
                  <div className="p-6 pt-0">
                    <button
                      className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-green-700 text-white shadow-md shadow-green-700/10 hover:shadow-lg hover:shadow-green-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                      type="button"
                      onClick={() => handleApprove(el._id)}
                    >
                      Approve
                    </button>
                  </div>
                ) : (
                  <button
                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-700 text-white shadow-md shadow-red-700/10 hover:shadow-lg hover:shadow-red-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                    type="button"
                    onClick={() => handleApprove(el._id)}
                  >
                    Revoke Access
                  </button>
                )}
              </div>
            </>
          ))
        : "No Request found"}
    </div>
  );
};

export default Requests;
