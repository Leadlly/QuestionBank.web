import { useEffect, useState } from "react";
import "./EditDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { getSubjects } from "../actions/subjectAction";
import { standards } from "../components/Options";
import { Select } from "antd";

const EditDetails = () => {
  const dispatch = useDispatch();
  const [standard, setStandard] = useState("12");
  const { subjectList = [], loading, error } = useSelector((state) => state.getSubject);

  useEffect(() => {
    if (standard) {
      dispatch(getSubjects(standard));
    }
  }, [standard, dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center pt-40 px-4">
     
      

      <div className="flex flex-wrap gap-4">
        {subjectList.length > 0 ? (
          subjectList.slice(0, 4).map((subject, index) => (
            <div
              key={index}
              className="relative z-0 flex-shrink-0 w-48 md:w-auto"
            >
              <Select
                disabled
                style={{ width: 200, backgroundColor: "#fff", color: "#000" }}
                value={subject}
                className="custom-dark-text no-dropdown-icon"
              />
            </div>
          ))
        ) : (
          <div>No subjects available</div>
        )}
      </div>
      <div className="relative z-0 w-full mb-5 mt-12 group items-center flex flex-col-reverse">
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Select Standard"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").includes(input)
          }
          onChange={(value) => {
            setStandard(value);
          }}
          options={standards}
        /></div>
    </div>
  );
};

export default EditDetails;
