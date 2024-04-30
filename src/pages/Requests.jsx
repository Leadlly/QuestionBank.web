import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
import { clearErrors, profile as fetchProfile } from "../actions/userAction";

const Requests = () => {
    const dispatch = useDispatch();

    const { error, user } = useSelector((state) => state.user);
    const profile = user ? user.profile : null;

    const handleApprove = async (id) => {
        try {
            const { data } = await axios.get(`${server}/api/user/verify/${id}`, {
                withCredentials: true,
            });
            toast.success(data.message);
            dispatch(fetchProfile());
        } catch (error) {
            console.error("Failed to approve request:", error);
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    useEffect(() => {
        if (error) {
            toast.error(error.response ? error.response.data.message : "Something went wrong");
            dispatch(clearErrors());
        }
        dispatch(fetchProfile());
    }, [error, dispatch]);

    return (
        <div className="flex flex-wrap">
            {profile && profile.requests ? (
                profile.requests.length > 0 ? (
                    profile.requests.map((request) => (
                        <div key={request._id} className="relative flex flex-col mt-6 m-7 text-white-700 bg-gray-700 shadow-md bg-clip-border rounded-xl w-96">
                            <div className="p-6">
                                <h5 className="block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                                    {request.name}
                                </h5>
                                <span
                                    className={request.status === "Not Verified" ? "text-red-400" : "text-green-500"}
                                >
                                    {request.status}
                                </span>
                                <p>{request.email}</p>
                            </div>
                            {request.status === "Not Verified" ? (
                                <div className="p-6 pt-0">
                                    <button
                                        className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-green-700 text-white shadow-md shadow-green-700/10 hover:shadow-lg hover:shadow-green-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                                        type="button"
                                        onClick={() => handleApprove(request._id)}
                                    >
                                        Approve
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 pt-0">
                                    <button
                                        className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-700 text-white shadow-md shadow-red-700/10 hover:shadow-lg hover:shadow-red-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                                        type="button"
                                        onClick={() => handleApprove(request._id)}
                                    >
                                        Revoke Access
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div>No request found</div>
                )
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default Requests;
