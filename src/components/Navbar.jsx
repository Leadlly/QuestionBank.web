import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userAction";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12h18M3 6h18M3 18h18"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                className="h-8 w-auto rounded-md"
                src="leadlly.jpeg"
                alt="Your Company"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className={`text-white hover:bg-gray-700 rounded-md px-3 py-2 text-sm font-medium ${
                    location.pathname === "/" ? "bg-gray-900" : ""
                  }`}
                  aria-current="page"
                >
                  Home
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      to="/subject"
                      className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                        location.pathname === "/subject" ? "bg-gray-900" : ""
                      }`}
                    >
                      Subject
                    </Link>
                    <Link
                      to="/chapter"
                      className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                        location.pathname === "/chapter" ? "bg-gray-900" : ""
                      }`}
                    >
                      Chapter
                    </Link>
                    <Link
                      to="/topic"
                      className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                        location.pathname === "/topic" ? "bg-gray-900" : ""
                      }`}
                    >
                      Topic
                    </Link>
                    <Link
                      to="/subtopic"
                      className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                        location.pathname === "/subtopic" ? "bg-gray-900" : ""
                      }`}
                    >
                      Sub Topic
                    </Link>
                    
                <Link
                  to="/editdetails"
                  className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                    location.pathname === "/editdetails" ? "bg-gray-900" : ""
                  }`}
                >
                  EditDetails
                </Link>
                  </>
                )}

                {isAuthenticated && (
                  <>
                    <Button
                      className="text-black-300 hover:bg-gray-700 hover:text-white rounded-md px-5 py-0 text-sm font-medium"
                      onClick={handleLogout}
                    >
                      Log Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {isAdmin && (
              <>

                <Link to="/request">
                  <button
                    type="button"
                    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                    {user?.requests?.filter(
                      (request) => request.status === "Not Verified"
                    ).length > 0 && (
                      <span className="bg-red-500 text-white text-[13px] px-1 rounded-[100%] absolute my-[-10px]">
                        {
                          user.requests.filter(
                            (request) => request.status === "Not Verified"
                          ).length
                        }
                      </span>
                    )}
                  </button>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="relative ml-3">
                <Link to="/profile">
                  <button
                    type="button"
                    className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {isAuthenticated ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    ) : (
                      "Login"
                    )}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`sm:hidden ${isMenuOpen ? "" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pb-3 pt-2">
          <Link
            to="/"
            className={`${
              location.pathname === "/" ? "bg-gray-900" : "hover:bg-gray-700"
            } text-white block rounded-md px-3 py-2 text-base font-medium`}
            aria-current="page"
          >
            Home
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/subject"
                className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              >
                Subject
              </Link>
              <Link
                to="/chapter"
                className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              >
                Chapter
              </Link>
              <Link
                to="/topic"
                className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              >
                Topic
              </Link>
              <Link
                to="/subtopic"
                className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              >
                Sub Topic
              </Link>
              <Link
                  to="/editdetails"
                 className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                >
                  EditDetails
                </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Button
                onClick={handleLogout}
                className="text-black-300 hover:bg-gray-700 hover:text-white rounded-md px-5 py-0 text-sm font-medium"
              >
                Log Out
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
