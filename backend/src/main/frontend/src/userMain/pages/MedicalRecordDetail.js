import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import QuickMenu from "../components/QuickMenu";
import SubCategories from "../components/SubCategory";
import ChatBot from "../components/ChatBot";

const MedicalRecordDetail = ({ recordId }) => {
  const location = useLocation();
  const { selectCategory, selectSubCategory } = location.state || {};
  const [record, setRecord] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecordDetail();
  }, [recordId]);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "미상";
    }
    return timestamp.split("T")[0];
  };

  const fetchRecordDetail = async () => {
    try {
      const response = await fetch(`/api/medical_record/detail?recordId=${recordId}`);
      const data = await response.json();
      if (!data.isEmpty) {
        const formattedData = {
          ...data,
          createAt: formatDate(data.createAt),
          outbreakAt: formatDate(data.outbreakAt)
        };
        setRecord(formattedData);
      } else {
        console.log("No data found for this board.");
      }
    } catch (error) {
      console.error("Error fetching board detail:", error);
    }
  };


  if (!record) {
    return (
      <div className="flex justify-center items-center h-screen">
        진료기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubCategories />
      <div className="container mx-auto px-4 py-8 flex flex-grow">
        <main className="flex-grow pr-8">
          <div className="w-full rounded-[10px] bg-white p-6 shadow-blue-700 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl">
                <span className="font-bold">진단 : <span className="text-sky-500"> {record.diagnosis}</span></span>
              </div>
              <div className="text-gray-600">방문일: {record.createAt}</div>
            </div>

            <hr className="border-t border-sky-200  mb-6" />
            <div className="mt-4 h-[360px]">
              <p className="font-bold">방문과 : <span
                className="font-medium text-sky-800 mr-11"> {record.departmentName}</span> 담당의 : <span
                className="font-medium text-sky-800 mr-11"> {record.doctorName}</span></p>
              <hr className="border-t border-2 border-dashed border-sky-200 mb-6 mt-4" />
              <p className="mb-6">발병일 : <span className="text-sky-800"> {record.outbreakAt}</span></p>
              <p className="mb-6">진료 내용 : <span className="font-bold text-sky-800"> {record.notes}</span></p>
              <p className="mb-6">치료 : <span className="font-bold text-sky-800"> {record.treatment}</span></p>

            </div>
          </div>
          <div className="flex justify-end items-center">
            <Link
              to={`/main/medicalHistory`} // 목록 페이지로 돌아가기
              state={{ selectCategory, selectSubCategory }}
              className="text-sky-600 hover:underline mr-4"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </main>
        <div className="flex flex-col space-y-4">
          <QuickMenu />
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordDetail;
