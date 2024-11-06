import  { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { profile as fetchProfile, verifyUser, clearErrors } from '../actions/userAction';
import Loader from '../components/Loader';
const Profile = () => {
    const dispatch = useDispatch();

    const { loading, error, user } = useSelector((state) => state.user);
    const { success: verifySuccess, error: verifyError } = useSelector((state) => state.verification);

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
          const errorMessage = typeof error === "string"
            ? error
            : error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : "Something went wrong";
          
          toast.error(errorMessage);
          dispatch(clearErrors());
        }
      
        if (verifyError) {
          const verifyErrorMessage = typeof verifyError === "string"
            ? verifyError
            : verifyError.response && verifyError.response.data && verifyError.response.data.message
              ? verifyError.response.data.message
              : "Something went wrong";
      
          toast.error(verifyErrorMessage);
          dispatch(clearErrors());
        }
      
        if (verifySuccess) {
          toast.success("User status updated successfully.");
          dispatch(fetchProfile());
        }
      }, [error, verifyError, verifySuccess, dispatch]);
      

    const handleVerification = (id) => {
        dispatch(verifyUser(id));
    };

    return (
        <div >
            {loading ? (
                <Loader />
            ) : (
                user ? (
                    <div >
                       
                        {user.requests && user.requests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       
                                {user.requests.map((request) => (
                                    <div key={request._id} className="relative flex flex-col mt-6 m-7 text-white-700 bg-gray-700 shadow-md bg-clip-border rounded-xl w-96">
                                        <div className="p-6">
                                            <h5  className="block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">{request.name}</h5>
                                            <span className={request.status === 'Not Verified' ? 'text-red-400' : 'text-green-500'}>
                                                {request.status}
                                            </span>
                                            <p>{request.email}</p>
                                        </div>
                                        <div>
                                            {request.status === 'Not Verified' ? (
                                                <div className="p-6 pt-0">

                                                <button
                                                    onClick={() => handleVerification(request._id)}
                                                    disabled={loading}
                                                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-green-700 text-white shadow-md shadow-green-700/10 hover:shadow-lg hover:shadow-green-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                                                >
                                                    Approve
                                                </button>
                                                </div>
                                            ) : (
                                                <div className="p-6 pt-0">
                                                <button
                                                    onClick={() => handleVerification(request._id)}
                                                    disabled={loading}
                                                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-6 rounded-lg bg-red-700 text-white shadow-md shadow-red-700/10 hover:shadow-lg hover:shadow-red-700/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none"
                                                >
                                                    Revoke Access
                                                </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No requests found.</p>
                        )}
                    </div>
                ) : (
                    <p>Failed to fetch profile data</p>
                )
            )}
        </div>
    );
};

export default Profile;
